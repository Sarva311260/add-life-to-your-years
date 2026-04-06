import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  createEvaluation,
  getUserEvaluations,
  getEvaluationById,
  createRecommendations,
  getRecommendationsByEvaluation,
  getUserByOpenId,
} from "./db";
import { generateEvaluationPDF } from "./pdfReport";
import { storagePut } from "./storage";
import { CATEGORIES, calculateOverallScore, hasCardiacFlag, getScoreLevelLabel, getOptionsForQuestion } from "../shared/questionnaire";
import { consultRouter } from "./routers/consult";
import { shopRouter } from "./routers/shop";

export const appRouter = router({
  system: systemRouter,
  consult: consultRouter,
  shop: shopRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  evaluation: router({
    submit: protectedProcedure
      .input(
        z.object({
          responses: z.record(z.string(), z.number()),
          categoryScores: z.record(z.string(), z.number()),
          demographics: z.object({
            gender: z.enum(["male", "female"]),
            age: z.number().min(1).max(150),
            heightUnit: z.enum(["metric", "imperial"]),
            heightCm: z.number().optional(),
            heightFt: z.number().optional(),
            heightIn: z.number().optional(),
            weightUnit: z.enum(["metric", "imperial"]),
            weightKg: z.number().optional(),
            weightLbs: z.number().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const overallScore = calculateOverallScore(input.categoryScores);
        const cardiacFlag = hasCardiacFlag(input.responses) ? 1 : 0;

        // Calculate BMI and convert to metric for storage
        let gender: string | undefined;
        let age: number | undefined;
        let heightCm: number | undefined;
        let weightKg: number | undefined;
        let bmi: number | undefined;

        if (input.demographics) {
          gender = input.demographics.gender;
          age = input.demographics.age;

          if (input.demographics.heightUnit === "metric") {
            heightCm = input.demographics.heightCm;
          } else if (input.demographics.heightFt) {
            const totalInches = (input.demographics.heightFt * 12) + (input.demographics.heightIn || 0);
            heightCm = Math.round(totalInches * 2.54 * 10) / 10;
          }

          if (input.demographics.weightUnit === "metric") {
            weightKg = input.demographics.weightKg;
          } else if (input.demographics.weightLbs) {
            weightKg = Math.round(input.demographics.weightLbs * 0.453592 * 10) / 10;
          }

          if (heightCm && weightKg) {
            const heightM = heightCm / 100;
            bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
          }
        }

        const evaluationId = await createEvaluation({
          userId: ctx.user.id,
          responses: input.responses,
          categoryScores: input.categoryScores,
          overallScore: overallScore.toString(),
          cardiacFlag,
          gender: gender || null,
          age: age || null,
          heightCm: heightCm?.toString() || null,
          weightKg: weightKg?.toString() || null,
          bmi: bmi?.toString() || null,
        });

        // Generate AI recommendations, with fallback to rule-based if LLM fails
        try {
          const recs = await generateRecommendations(
            input.categoryScores,
            input.responses,
            overallScore,
            cardiacFlag === 1
          );
          await createRecommendations(
            recs.map((r) => ({
              evaluationId,
              userId: ctx.user.id,
              category: r.category,
              title: r.title,
              description: r.description,
              priority: r.priority as "high" | "medium" | "low",
              actionSteps: r.actionSteps,
            }))
          );
        } catch (error) {
          console.error("[AI Recommendations] LLM failed, using fallback:", error);
          // Fallback: generate rule-based recommendations from scores
          const fallbackRecs = generateFallbackRecommendations(input.categoryScores, cardiacFlag === 1);
          await createRecommendations(
            fallbackRecs.map((r) => ({
              evaluationId,
              userId: ctx.user.id,
              category: r.category,
              title: r.title,
              description: r.description,
              priority: r.priority as "high" | "medium" | "low",
              actionSteps: r.actionSteps,
            }))
          );
        }

        // Send notifications (fire-and-forget, don't block the response)
        const userName = ctx.user.name || "User";
        const userEmail = ctx.user.email || "No email";
        const scoreLevelLabel = getScoreLevelLabel(overallScore);

        // Check if this is the user's first evaluation
        const previousEvals = await getUserEvaluations(ctx.user.id);
        const isFirstEvaluation = previousEvals.length <= 1; // includes the one just created

        if (isFirstEvaluation) {
          // Build detailed notification with category scores and individual answers
          const categoryBreakdown = CATEGORIES.map((cat) => {
            const catScore = input.categoryScores[cat.id];
            const scoreLabel = getScoreLevelLabel(catScore ?? 0);
            const questionDetails = cat.questions.map((q) => {
              const responseValue = input.responses[q.id];
              const options = getOptionsForQuestion(q);
              const selectedOption = options.find((o) => o.value === responseValue);
              const answerLabel = selectedOption ? selectedOption.label : `${responseValue ?? "N/A"}`;
              return `  - ${q.text}: ${answerLabel} (${responseValue ?? "N/A"}/5)`;
            }).join("\n");
            return `📊 ${cat.name}: ${Math.round(catScore ?? 0)}% (${scoreLabel})\n${questionDetails}`;
          }).join("\n\n");

          // Build report link using the origin from the request
          const origin = ctx.req.headers.origin || ctx.req.headers.referer?.replace(/\/[^/]*$/, '') || '';
          const reportLink = `${origin}/report/${evaluationId}`;

          notifyOwner({
            title: `First Evaluation Completed: ${userName}`,
            content: `${userName} (${userEmail}) has completed their first wellness evaluation!\n\n` +
              `🏆 Overall Score: ${Math.round(overallScore)}% (${scoreLevelLabel})\n` +
              `${cardiacFlag ? "⚠️ Cardiac flag detected\n" : ""}` +
              `📄 View Full Report: ${reportLink}\n` +
              `\n--- Category Breakdown & Responses ---\n\n${categoryBreakdown}\n\n` +
              `This is a great opportunity to reach out and offer personalised coaching support.`,
          }).catch((err) => {
            console.warn("[Notification] Failed to send first evaluation notification:", err);
          });
        }

        return { evaluationId, overallScore, cardiacFlag, bmi: bmi || null };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return getUserEvaluations(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.id);
        if (!evaluation || evaluation.userId !== ctx.user.id) {
          return null;
        }
        return evaluation;
      }),

    getRecommendations: protectedProcedure
      .input(z.object({ evaluationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.evaluationId);
        if (!evaluation || evaluation.userId !== ctx.user.id) {
          return [];
        }
        return getRecommendationsByEvaluation(input.evaluationId);
      }),

    generatePDF: protectedProcedure
      .input(z.object({ evaluationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.evaluationId);
        if (!evaluation || evaluation.userId !== ctx.user.id) {
          throw new Error("Evaluation not found");
        }

        const recs = await getRecommendationsByEvaluation(input.evaluationId);
        const recsData = recs.map((r) => ({
          category: r.category,
          title: r.title,
          description: r.description,
          priority: r.priority,
          actionSteps: (r.actionSteps as string[]) || [],
        }));

        const user = await getUserByOpenId(ctx.user.openId);

        const pdfBuffer = await generateEvaluationPDF(
          {
            id: evaluation.id,
            overallScore: evaluation.overallScore,
            categoryScores: evaluation.categoryScores as Record<string, number>,
            responses: evaluation.responses as Record<string, number>,
            cardiacFlag: evaluation.cardiacFlag,
            gender: evaluation.gender,
            age: evaluation.age,
            heightCm: evaluation.heightCm,
            weightKg: evaluation.weightKg,
            bmi: evaluation.bmi,
            completedAt: evaluation.completedAt,
          },
          recsData,
          user ? { name: user.name, email: user.email } : undefined
        );

        // Upload to S3
        const timestamp = Date.now();
        const fileKey = `reports/wellness-report-${evaluation.id}-${timestamp}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

        // Notify owner with the PDF link
        const userName = ctx.user.name || "User";
        const userEmail = ctx.user.email || "No email";
        const overallScore = typeof evaluation.overallScore === "string" ? parseFloat(evaluation.overallScore) : evaluation.overallScore;
        notifyOwner({
          title: `PDF Report Generated: ${userName}`,
          content: `${userName} (${userEmail}) has downloaded their wellness evaluation report.\n\n` +
            `Overall Score: ${Math.round(overallScore)}%\n` +
            `Report Link: ${url}`,
        }).catch((err) => {
          console.warn("[Notification] Failed to send PDF notification:", err);
        });

        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ---- AI Recommendation Engine ----

async function generateRecommendations(
  categoryScores: Record<string, number>,
  responses: Record<string, number>,
  overallScore: number,
  cardiacFlag: boolean
) {
  const categoryDetails = CATEGORIES.map((cat) => {
    const score = categoryScores[cat.id] ?? 0;
    const questionDetails = cat.questions.map((q) => {
      const answer = responses[q.id];
      const option = q.options?.find((o) => o.value === answer);
      return `  - ${q.text}: ${option?.label ?? `Score ${answer}`}`;
    });
    return `${cat.name} (Score: ${score}%):\n${questionDetails.join("\n")}`;
  }).join("\n\n");

  const prompt = `You are a wellness coach AI assistant. Based on the following self-evaluation results, generate personalized health and wellness recommendations.

Overall Wellness Score: ${overallScore}%
${cardiacFlag ? "⚠️ CARDIAC FLAG: The user has indicated personal or family history of heart disease. Include appropriate cardiac-related recommendations and note the importance of consulting a healthcare provider." : ""}
${responses["trauma_amalgam"] && responses["trauma_amalgam"] <= 3 ? "⚠️ DENTAL HEALTH FLAG: The user has indicated they have amalgam fillings and/or root canal treatments. In the Physical Trauma recommendation, strongly suggest having amalgam fillings removed by a qualified bio-compatible dentist who follows safe mercury removal protocols. Explain that amalgam fillings contain mercury which can affect overall health and wellbeing." : ""}
${responses["trauma_implants"] && responses["trauma_implants"] <= 3 ? "⚠️ IMPLANT FLAG: The user has indicated they have medical implants. In the Physical Trauma recommendation, include advice about monitoring implant health, regular check-ups with relevant specialists, and being aware of any symptoms that may be related to implant materials." : ""}

Category Scores and Responses:
${categoryDetails}

Generate EXACTLY 8 recommendations — one for EACH of these categories: ${CATEGORIES.map((c) => c.id).join(", ")}. Every category MUST have a recommendation, even high-scoring ones (for those, provide maintenance tips).

For each recommendation, provide:
- category: The category ID (MUST be one of: ${CATEGORIES.map((c) => c.id).join(", ")})
- title: A concise, actionable title
- description: A detailed explanation (2-3 sentences) of why this matters and what to do
- priority: "high" (score < 40%), "medium" (40-69%), or "low" (70%+) based on urgency
- actionSteps: An array of 3-5 specific, concrete action steps

For high-scoring categories (70%+), provide encouraging maintenance recommendations. For lower-scoring categories, focus on improvement strategies. Be encouraging, practical, and specific. Reference whole food plant-based nutrition where relevant.`;

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a knowledgeable wellness coach specializing in whole food plant-based nutrition and holistic health. You provide evidence-based, practical, and encouraging recommendations. Always respond with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "wellness_recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                  },
                  actionSteps: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["category", "title", "description", "priority", "actionSteps"],
                additionalProperties: false,
              },
            },
          },
          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = result.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No content in LLM response");
  }

  const parsed = JSON.parse(content);
  let recs = parsed.recommendations as Array<{
    category: string;
    title: string;
    description: string;
    priority: string;
    actionSteps: string[];
  }>;

  // Ensure all 8 categories have a recommendation — fill gaps with fallback
  const coveredCategories = new Set(recs.map((r) => r.category));
  for (const cat of CATEGORIES) {
    if (!coveredCategories.has(cat.id)) {
      const fallback = FALLBACK_ADVICE[cat.id];
      if (fallback) {
        const score = categoryScores[cat.id] ?? 0;
        recs.push({
          category: cat.id,
          title: fallback.title,
          description: fallback.description,
          priority: score < 40 ? "high" : score < 70 ? "medium" : "low",
          actionSteps: fallback.actionSteps,
        });
      }
    }
  }

  return recs;
}


// ---- Fallback Rule-Based Recommendations ----

const FALLBACK_ADVICE: Record<string, { title: string; description: string; actionSteps: string[] }> = {
  lifestyle: {
    title: "Improve Your Daily Lifestyle Habits",
    description: "Your lifestyle choices directly impact your health trajectory. Small, consistent changes in diet, exercise, and sleep can compound into significant improvements over time.",
    actionSteps: [
      "Add one additional serving of whole fruits or vegetables to each meal",
      "Aim for 30 minutes of moderate physical activity at least 5 days per week",
      "Establish a consistent sleep schedule with 7-9 hours per night",
      "Reduce processed food intake by preparing more meals at home",
      "Stay hydrated with at least 8 glasses of water daily",
    ],
  },
  environmental: {
    title: "Optimise Your Living Environment",
    description: "Your surroundings play a crucial role in your health. Improving air quality, accessing healthy food, and creating a supportive environment can significantly boost wellbeing.",
    actionSteps: [
      "Assess your home for air quality issues and consider an air purifier if needed",
      "Identify the nearest sources of fresh, whole food produce in your area",
      "Create a dedicated space for physical activity or relaxation at home",
      "Take regular breaks from your work environment to move and stretch",
      "Explore community resources for health and wellness support",
    ],
  },
  genetic: {
    title: "Understand and Manage Your Genetic Factors",
    description: "While you cannot change your genes, understanding your family health history and making informed lifestyle choices can positively influence gene expression through epigenetics.",
    actionSteps: [
      "Document your family health history for major conditions",
      "Schedule appropriate health screenings based on your family history",
      "Learn about epigenetics and how lifestyle affects gene expression",
      "Adopt a whole food plant-based diet to support positive gene expression",
      "Discuss genetic risk factors with your healthcare provider",
    ],
  },
  structural: {
    title: "Address Structural Barriers to Health",
    description: "Systemic and structural factors like income, healthcare access, and community resources significantly affect health outcomes. Identifying and navigating these barriers is an important step.",
    actionSteps: [
      "Research community health resources and support programs available to you",
      "Explore telehealth options for more accessible healthcare",
      "Connect with local wellness groups or community organisations",
      "Advocate for better health resources in your community",
      "Build a support network of people who share your health goals",
    ],
  },
  stress: {
    title: "Strengthen Your Stress Management",
    description: "Chronic stress affects every system in your body. Developing effective coping strategies and building resilience can dramatically improve your overall health and quality of life.",
    actionSteps: [
      "Practice deep breathing or meditation for 10 minutes daily",
      "Set clear boundaries between work and personal time",
      "Identify your top three stress triggers and develop specific coping plans",
      "Engage in regular physical activity as a stress outlet",
      "Consider journaling to process thoughts and emotions",
    ],
  },
  purpose: {
    title: "Cultivate Purpose and Direction",
    description: "Having a sense of purpose is linked to better health outcomes and longevity. Connecting with your values and setting meaningful goals provides motivation for healthy living.",
    actionSteps: [
      "Reflect on your core values and what gives your life meaning",
      "Set three specific, achievable health goals for the next month",
      "Explore activities that bring you joy and fulfilment",
      "Consider how your health goals connect to your broader life purpose",
      "Share your goals with someone who can support your journey",
    ],
  },
  relationships: {
    title: "Nurture Meaningful Relationships",
    description: "Strong social connections are one of the most powerful predictors of health and longevity. Investing in relationships provides emotional support, accountability, and a sense of belonging.",
    actionSteps: [
      "Schedule regular quality time with people who matter to you",
      "Join a community group aligned with your interests or health goals",
      "Practice active listening and empathy in your conversations",
      "Reach out to someone you haven't connected with recently",
      "Consider a wellness buddy for mutual support and accountability",
    ],
  },
  physical_trauma: {
    title: "Address Physical Health and Recovery",
    description: "Past injuries, chronic pain, and physical limitations need proper attention and management. Working with healthcare professionals and adopting supportive practices can aid recovery and prevent further issues.",
    actionSteps: [
      "Consult with a healthcare professional about any ongoing pain or limitations",
      "Explore gentle movement practices like yoga, tai chi, or swimming",
      "Prioritise proper posture and ergonomics in daily activities",
      "Consider physiotherapy or rehabilitation for persistent issues",
      "Practice anti-inflammatory nutrition with whole plant-based foods",
    ],
  },
};

function generateFallbackRecommendations(
  categoryScores: Record<string, number>,
  cardiacFlag: boolean
): Array<{ category: string; title: string; description: string; priority: string; actionSteps: string[] }> {
  const recs: Array<{ category: string; title: string; description: string; priority: string; actionSteps: string[] }> = [];

  // Sort categories by score (lowest first) to prioritise
  const sorted = Object.entries(categoryScores).sort((a, b) => a[1] - b[1]);

  for (const [catId, score] of sorted) {
    const advice = FALLBACK_ADVICE[catId];
    if (!advice) continue;

    const priority = score < 40 ? "high" : score < 70 ? "medium" : "low";
    recs.push({
      category: catId,
      title: advice.title,
      description: advice.description,
      priority,
      actionSteps: advice.actionSteps,
    });
  }

  // Add cardiac-specific recommendation if flagged
  if (cardiacFlag) {
    recs.unshift({
      category: "genetic",
      title: "Cardiac Health: Consult Your Healthcare Provider",
      description: "You indicated a personal or family history of heart disease. It is important to work with a healthcare provider for appropriate screening, monitoring, and preventive care tailored to your risk profile.",
      priority: "high",
      actionSteps: [
        "Schedule a cardiovascular health check-up with your doctor",
        "Discuss your family history of heart disease with your provider",
        "Adopt a heart-healthy whole food plant-based diet low in saturated fat",
        "Engage in regular moderate cardiovascular exercise as approved by your doctor",
        "Monitor blood pressure and cholesterol levels regularly",
      ],
    });
  }

  return recs;
}
