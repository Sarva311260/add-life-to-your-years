import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import {
  createConsultation,
  getConsultationById,
  getUserConsultations,
  updateConsultation,
  addConsultMessage,
  getConsultMessages,
  createConsultReport,
  getConsultReport,
  getUserConsultReports,
  getLatestEvaluationByUserId,
  getRecommendationsByEvaluation,
  getUserByOpenId,
} from "../db";
import {
  buildConsultSystemPrompt,
  buildReportPrompt,
  CONSULTATION_PHASES,
  HEALTH_CONDITIONS,
  BOOK_RECOMMENDATIONS,
} from "../consultKnowledge";
import { CATEGORIES } from "../../shared/questionnaire";
import { RECOMMENDATION_VIDEOS, getVideoLinksMarkdown } from "../../shared/videoMap";

export const consultRouter = router({
  /** Get available health conditions for the condition selector */
  getConditions: protectedProcedure.query(() => {
    return HEALTH_CONDITIONS;
  }),

  /** Get consultation phases info */
  getPhases: protectedProcedure.query(() => {
    return CONSULTATION_PHASES;
  }),

  /** Start a new consultation session */
  start: protectedProcedure
    .input(
      z.object({
        consultType: z.enum(["full_review", "specific_conditions"]),
        selectedConditions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has a self-evaluation
      const latestEval = await getLatestEvaluationByUserId(ctx.user.id);

      const consultationId = await createConsultation({
        userId: ctx.user.id,
        consultType: input.consultType,
        selectedConditions: input.selectedConditions || null,
        currentPhase: 1,
        status: "active",
        evaluationId: latestEval?.id || null,
      });

      // Build evaluation summary if available
      let evaluationSummary: string | undefined;
      if (latestEval) {
        const catScores = latestEval.categoryScores as Record<string, number>;
        evaluationSummary = `Overall Score: ${Math.round(Number(latestEval.overallScore))}%\n`;
        evaluationSummary += `BMI: ${latestEval.bmi || "Not provided"}\n`;
        evaluationSummary += `Age: ${latestEval.age || "Not provided"}\n`;
        evaluationSummary += `Gender: ${latestEval.gender || "Not provided"}\n\n`;
        evaluationSummary += "Category Scores:\n";
        for (const cat of CATEGORIES) {
          const score = catScores[cat.id];
          if (score !== undefined) {
            evaluationSummary += `- ${cat.name}: ${Math.round(score)}%\n`;
          }
        }
      }

      // Generate the initial AI greeting
      const systemPrompt = buildConsultSystemPrompt(
        1,
        input.consultType,
        input.selectedConditions,
        evaluationSummary,
      );

      const greeting = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: input.consultType === "full_review"
              ? "I'd like to do a complete personal wellness review."
              : `I'd like help with: ${input.selectedConditions?.join(", ") || "my health concern"}.`,
          },
        ],
      });

      const rawGreeting = greeting.choices[0]?.message?.content;
      const greetingContent = (typeof rawGreeting === "string" ? rawGreeting : "") || "Welcome! I'm glad you're here. Tell me, what brings you to this wellness consultation today?";

      // Save the system message and greeting
      await addConsultMessage({
        consultationId,
        role: "system",
        content: systemPrompt,
        phase: 1,
      });
      await addConsultMessage({
        consultationId,
        role: "assistant",
        content: greetingContent,
        phase: 1,
      });

      // Notify owner
      notifyOwner({
        title: "New Wellness Consultation Started",
        content: `${ctx.user.name || ctx.user.email || "A user"} has started a ${input.consultType === "full_review" ? "Complete Wellness Review" : `consultation for: ${input.selectedConditions?.join(", ")}`}.`,
      }).catch(() => {});

      return {
        consultationId,
        greeting: greetingContent,
        phase: 1,
        hasEvaluation: !!latestEval,
      };
    }),

  /** Send a message in the consultation and get AI response */
  sendMessage: protectedProcedure
    .input(
      z.object({
        consultationId: z.number(),
        message: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId);
      if (!consultation || consultation.userId !== ctx.user.id) {
        throw new Error("Consultation not found");
      }
      if (consultation.status === "completed") {
        throw new Error("This consultation has already been completed");
      }

      // Save user message
      await addConsultMessage({
        consultationId: input.consultationId,
        role: "user",
        content: input.message,
        phase: consultation.currentPhase,
      });

      // Get conversation history
      const messages = await getConsultMessages(input.consultationId);

      // Build evaluation summary if available
      let evaluationSummary: string | undefined;
      if (consultation.evaluationId) {
        const latestEval = await getLatestEvaluationByUserId(ctx.user.id);
        if (latestEval) {
          const catScores = latestEval.categoryScores as Record<string, number>;
          evaluationSummary = `Overall Score: ${Math.round(Number(latestEval.overallScore))}%\n`;
          evaluationSummary += `BMI: ${latestEval.bmi || "Not provided"}\n`;
          evaluationSummary += `Age: ${latestEval.age || "Not provided"}\n`;
          evaluationSummary += `Gender: ${latestEval.gender || "Not provided"}\n\n`;
          evaluationSummary += "Category Scores:\n";
          for (const cat of CATEGORIES) {
            const score = catScores[cat.id];
            if (score !== undefined) {
              evaluationSummary += `- ${cat.name}: ${Math.round(score)}%\n`;
            }
          }
        }
      }

      // Build conversation context from history (exclude system messages for context)
      const conversationContext = messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role === "user" ? "User" : "Sarva"}: ${m.content}`)
        .join("\n\n");

      // Determine if we should advance the phase based on message count in current phase
      const currentPhaseMessages = messages.filter(
        (m) => m.phase === consultation.currentPhase && m.role !== "system"
      );
      const selectedConditions = consultation.selectedConditions as string[] | null;

      // Phase advancement logic: advance after enough exchanges in current phase
      let currentPhase = consultation.currentPhase;
      const exchangeCount = Math.floor(currentPhaseMessages.length / 2); // pairs of user+assistant

      const phaseThresholds: Record<number, number> = {
        1: 2, // Welcome: 2 exchanges
        2: 3, // Health Snapshot: 3 exchanges
        3: 4, // Deep Dive: 4 exchanges
        4: 2, // Insights: 2 exchanges
        5: 2, // Recommendations: 2 exchanges
        6: 1, // Action Plan: 1 exchange
      };

      if (exchangeCount >= (phaseThresholds[currentPhase] || 3) && currentPhase < 6) {
        currentPhase = currentPhase + 1;
        await updateConsultation(input.consultationId, { currentPhase });
      }

      // Get user's first name for personalisation
      const userRecord = await getUserByOpenId(ctx.user.openId);
      const firstName = userRecord?.firstName || undefined;

      // Build the system prompt for current phase
      const systemPrompt = buildConsultSystemPrompt(
        currentPhase,
        consultation.consultType as "full_review" | "specific_conditions",
        selectedConditions || undefined,
        evaluationSummary,
        conversationContext,
        firstName,
      );

      // Build LLM messages
      const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      // Add recent conversation history (last 20 messages to stay within context)
      const recentMessages = messages
        .filter((m) => m.role !== "system")
        .slice(-20);
      for (const msg of recentMessages) {
        llmMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }

      // Add the current user message
      llmMessages.push({ role: "user", content: input.message });

      // Get AI response
      const response = await invokeLLM({ messages: llmMessages });
      const rawContent = response.choices[0]?.message?.content;
      const aiContent = (typeof rawContent === "string" ? rawContent : "") || "I appreciate you sharing that. Could you tell me a bit more?";

      // Save AI response
      await addConsultMessage({
        consultationId: input.consultationId,
        role: "assistant",
        content: aiContent,
        phase: currentPhase,
      });

      // Check if consultation is complete
      const isComplete = aiContent.includes("[CONSULTATION_COMPLETE]");
      if (isComplete) {
        await updateConsultation(input.consultationId, { status: "completed" });

        // Generate the formal report
        try {
          const allMessages = await getConsultMessages(input.consultationId);
          const fullConversation = allMessages
            .filter((m) => m.role !== "system")
            .map((m) => `${m.role === "user" ? "User" : "Sarva"}: ${m.content}`)
            .join("\n\n");

          // Get user's first name
          const user = await getUserByOpenId(ctx.user.openId);
          const firstName = user?.firstName || undefined;

          // Get video links for all book recommendations (the LLM will match relevant ones)
          const allRecIds = BOOK_RECOMMENDATIONS.map(r => r.id);
          const videoLinksMarkdown = getVideoLinksMarkdown(allRecIds);

          const reportPrompt = buildReportPrompt(
            consultation.consultType,
            selectedConditions,
            fullConversation,
            evaluationSummary,
            firstName,
            videoLinksMarkdown,
          );

          const reportResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are Sarva Keller, a wellness coach. Generate a comprehensive, personalised wellness report in Markdown format." },
              { role: "user", content: reportPrompt },
            ],
          });

          const rawReport = reportResponse.choices[0]?.message?.content;
          const reportContent = (typeof rawReport === "string" ? rawReport : "") || "Report generation failed.";

          // Extract recommendations from the report
          const recMatches = reportContent.match(/### .+/g) || [];
          const reportRecs = recMatches.map((title: string) => ({
            title: title.replace("### ", ""),
            source: "consultation",
          }));

          await createConsultReport({
            consultationId: input.consultationId,
            userId: ctx.user.id,
            content: reportContent,
            recommendations: reportRecs,
            productRecommendations: null,
          });

          // Notify owner
          notifyOwner({
            title: "Wellness Consultation Completed",
            content: `${ctx.user.name || ctx.user.email || "A user"} has completed their wellness consultation.\nType: ${consultation.consultType}\nPhases completed: ${currentPhase}/6`,
          }).catch(() => {});
        } catch (err) {
          console.error("[Consult] Failed to generate report:", err);
        }
      }

      return {
        response: aiContent.replace("[CONSULTATION_COMPLETE]", "").trim(),
        phase: currentPhase,
        isComplete,
        totalPhases: 6,
      };
    }),

  /** Get a consultation by ID with its messages */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.id);
      if (!consultation || consultation.userId !== ctx.user.id) {
        return null;
      }
      const messages = await getConsultMessages(input.id);
      const report = await getConsultReport(input.id);
      return {
        ...consultation,
        messages: messages.filter((m) => m.role !== "system"),
        report,
      };
    }),

  /** Get user's consultation history */
  history: protectedProcedure.query(async ({ ctx }) => {
    return getUserConsultations(ctx.user.id);
  }),

  /** Get a consultation report */
  getReport: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId);
      if (!consultation || consultation.userId !== ctx.user.id) {
        return null;
      }
      return getConsultReport(input.consultationId);
    }),

  /** Get all user's reports */
  reports: protectedProcedure.query(async ({ ctx }) => {
    return getUserConsultReports(ctx.user.id);
  }),

  /** Get the user's most recent active (incomplete) consultation */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const allConsults = await getUserConsultations(ctx.user.id);
    const active = allConsults.find((c) => c.status === "active");
    if (!active) return null;
    const messages = await getConsultMessages(active.id);
    const userMessages = messages.filter((m) => m.role !== "system");
    return {
      id: active.id,
      consultType: active.consultType,
      selectedConditions: active.selectedConditions,
      currentPhase: active.currentPhase,
      messageCount: userMessages.length,
      createdAt: active.createdAt,
      updatedAt: active.updatedAt,
    };
  }),

  /** Check if user has completed a self-evaluation */
  checkEvaluation: protectedProcedure.query(async ({ ctx }) => {
    const latestEval = await getLatestEvaluationByUserId(ctx.user.id);
    return {
      hasEvaluation: !!latestEval,
      evaluationId: latestEval?.id || null,
      overallScore: latestEval ? Math.round(Number(latestEval.overallScore)) : null,
      completedAt: latestEval?.completedAt || null,
    };
  }),
});
