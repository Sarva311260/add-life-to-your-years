import PDFDocument from "pdfkit";
import {
  CATEGORIES,
  getScoreLevelLabel,
  getBMICategory,
  getOptionsForQuestion,
} from "../shared/questionnaire";

interface EvaluationData {
  id: number;
  overallScore: string | number;
  categoryScores: Record<string, number>;
  responses: Record<string, number>;
  cardiacFlag: number;
  gender?: string | null;
  age?: number | null;
  heightCm?: string | number | null;
  weightKg?: string | number | null;
  bmi?: string | number | null;
  completedAt: Date;
}

interface RecommendationData {
  category: string;
  title: string;
  description: string;
  priority: string;
  actionSteps: string[];
}

interface UserData {
  name?: string | null;
  email?: string | null;
}

export async function generateEvaluationPDF(
  evaluation: EvaluationData,
  recommendations: RecommendationData[],
  user?: UserData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - 100; // margins
      const overallScore = typeof evaluation.overallScore === "string"
        ? parseFloat(evaluation.overallScore)
        : evaluation.overallScore;
      const scoreLevelLabel = getScoreLevelLabel(overallScore);

      // ========== HEADER ==========
      doc.fontSize(24).font("Helvetica-Bold").fillColor("#1a5c1a")
        .text("Health, Wellness & Vitality", { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(14).font("Helvetica").fillColor("#555555")
        .text("Wellness Self-Evaluation Report", { align: "center" });
      doc.moveDown(0.5);

      // Date and user info
      const dateStr = new Date(evaluation.completedAt).toLocaleDateString("en-AU", {
        year: "numeric", month: "long", day: "numeric",
      });
      doc.fontSize(10).fillColor("#777777")
        .text(`Date: ${dateStr}`, { align: "center" });
      if (user?.name) {
        doc.text(`Prepared for: ${user.name}`, { align: "center" });
      }
      doc.moveDown(1);

      // Divider
      drawDivider(doc);
      doc.moveDown(0.5);

      // ========== OVERALL SCORE ==========
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#333333")
        .text("Overall Wellness Score", { align: "center" });
      doc.moveDown(0.5);

      const scoreColor = overallScore >= 70 ? "#2e7d32" : overallScore >= 40 ? "#e65100" : "#c62828";
      doc.fontSize(48).font("Helvetica-Bold").fillColor(scoreColor)
        .text(`${Math.round(overallScore)}%`, { align: "center" });
      doc.fontSize(14).font("Helvetica").fillColor(scoreColor)
        .text(scoreLevelLabel, { align: "center" });
      doc.moveDown(1);

      // ========== BMI ==========
      if (evaluation.bmi) {
        const bmiVal = typeof evaluation.bmi === "string" ? parseFloat(evaluation.bmi) : evaluation.bmi;
        const bmiInfo = getBMICategory(bmiVal);
        const bmiColor = bmiInfo.score >= 4 ? "#2e7d32" : bmiInfo.score >= 3 ? "#e65100" : "#c62828";

        doc.fontSize(12).font("Helvetica-Bold").fillColor("#333333")
          .text("Body Mass Index (BMI)", { align: "center" });
        doc.fontSize(20).font("Helvetica-Bold").fillColor(bmiColor)
          .text(`${bmiVal.toFixed(1)} — ${bmiInfo.label}`, { align: "center" });

        if (evaluation.gender || evaluation.age) {
          const parts: string[] = [];
          if (evaluation.gender) parts.push(evaluation.gender === "male" ? "Male" : "Female");
          if (evaluation.age) parts.push(`Age ${evaluation.age}`);
          if (evaluation.heightCm) {
            const h = typeof evaluation.heightCm === "string" ? parseFloat(evaluation.heightCm) : evaluation.heightCm;
            parts.push(`Height ${h.toFixed(0)} cm`);
          }
          if (evaluation.weightKg) {
            const w = typeof evaluation.weightKg === "string" ? parseFloat(evaluation.weightKg) : evaluation.weightKg;
            parts.push(`Weight ${w.toFixed(0)} kg`);
          }
          doc.fontSize(10).font("Helvetica").fillColor("#777777")
            .text(parts.join(" · "), { align: "center" });
        }
        doc.moveDown(1);
      }

      // ========== CARDIAC FLAG ==========
      if (evaluation.cardiacFlag === 1) {
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#c62828")
          .text("⚠ Cardiac Health Flag", { align: "left" });
        doc.fontSize(10).font("Helvetica").fillColor("#c62828")
          .text(
            "You indicated a personal or family history of heart disease. You might like to consider contacting your healthcare provider for appropriate screening and preventive care.",
            { align: "left" }
          );
        doc.moveDown(1);
      }

      drawDivider(doc);
      doc.moveDown(0.5);

      // ========== CATEGORY SCORES ==========
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#333333")
        .text("Category Scores", { align: "left" });
      doc.moveDown(0.5);

      CATEGORIES.forEach((cat) => {
        const score = evaluation.categoryScores[cat.id] ?? 0;
        const level = getScoreLevelLabel(score);
        const color = score >= 70 ? "#2e7d32" : score >= 40 ? "#e65100" : "#c62828";

        checkPageBreak(doc, 40);

        // Category name and score on same line
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#333333")
          .text(`${cat.name}`, { continued: true });
        doc.font("Helvetica").fillColor(color)
          .text(`  ${Math.round(score)}% — ${level}`, { align: "right" });

        // Score bar
        const barY = doc.y + 2;
        const barWidth = pageWidth;
        const barHeight = 8;
        doc.rect(50, barY, barWidth, barHeight).fill("#e0e0e0");
        const fillWidth = (score / 100) * barWidth;
        if (fillWidth > 0) {
          doc.rect(50, barY, fillWidth, barHeight).fill(color);
        }
        doc.y = barY + barHeight + 8;
      });

      doc.moveDown(0.5);
      drawDivider(doc);
      doc.moveDown(0.5);

      // ========== INDIVIDUAL RESPONSES ==========
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#333333")
        .text("Your Responses", { align: "left" });
      doc.moveDown(0.5);

      CATEGORIES.forEach((cat) => {
        checkPageBreak(doc, 60);
        doc.fontSize(13).font("Helvetica-Bold").fillColor("#1a5c1a")
          .text(cat.name);
        doc.moveDown(0.3);

        cat.questions.forEach((q) => {
          checkPageBreak(doc, 40);
          const selectedValue = evaluation.responses[q.id];
          const options = getOptionsForQuestion(q);
          const selectedOption = options.find((o) => o.value === selectedValue);

          doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333")
            .text(q.text, { indent: 10 });
          doc.fontSize(9).font("Helvetica").fillColor("#555555")
            .text(`Answer: ${selectedOption?.label || "Not answered"} (${selectedValue || 0}/5)`, { indent: 20 });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      });

      // ========== RECOMMENDATIONS ==========
      if (recommendations.length > 0) {
        checkPageBreak(doc, 80);
        drawDivider(doc);
        doc.moveDown(0.5);

        doc.fontSize(16).font("Helvetica-Bold").fillColor("#333333")
          .text("Personalised Recommendations", { align: "left" });
        doc.moveDown(0.5);

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const sortedRecs = [...recommendations].sort(
          (a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
                     (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
        );

        sortedRecs.forEach((rec) => {
          checkPageBreak(doc, 80);

          const catName = CATEGORIES.find((c) => c.id === rec.category)?.name || rec.category;
          const priorityLabel = rec.priority === "high" ? "HIGH PRIORITY" :
                                rec.priority === "medium" ? "MEDIUM PRIORITY" : "LOW PRIORITY";
          const priorityColor = rec.priority === "high" ? "#c62828" :
                                rec.priority === "medium" ? "#e65100" : "#2e7d32";

          doc.fontSize(10).font("Helvetica").fillColor("#777777")
            .text(`${catName} · `, { continued: true });
          doc.font("Helvetica-Bold").fillColor(priorityColor)
            .text(priorityLabel);

          doc.fontSize(12).font("Helvetica-Bold").fillColor("#333333")
            .text(rec.title);
          doc.fontSize(10).font("Helvetica").fillColor("#555555")
            .text(rec.description);

          if (rec.actionSteps?.length > 0) {
            doc.moveDown(0.2);
            doc.fontSize(9).font("Helvetica-Bold").fillColor("#777777")
              .text("Action Steps:");
            rec.actionSteps.forEach((step, j) => {
              checkPageBreak(doc, 20);
              doc.fontSize(9).font("Helvetica").fillColor("#555555")
                .text(`  ${j + 1}. ${step}`, { indent: 15 });
            });
          }
          doc.moveDown(0.8);
        });
      }

      // ========== FOOTER ==========
      checkPageBreak(doc, 60);
      drawDivider(doc);
      doc.moveDown(0.5);
      doc.fontSize(9).font("Helvetica").fillColor("#999999")
        .text(
          "This report is generated by the Health, Wellness & Vitality self-evaluation tool. It is intended for informational purposes only and does not constitute medical advice. Please consult with a qualified healthcare provider for personalised medical guidance.",
          { align: "center" }
        );
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor("#bbbbbb")
        .text(`Report ID: ${evaluation.id} · Generated: ${new Date().toISOString()}`, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function drawDivider(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y)
    .strokeColor("#e0e0e0").lineWidth(1).stroke();
  doc.y = y + 2;
}

function checkPageBreak(doc: PDFKit.PDFDocument, requiredSpace: number) {
  if (doc.y + requiredSpace > doc.page.height - 60) {
    doc.addPage();
  }
}
