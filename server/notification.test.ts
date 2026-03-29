import { describe, it, expect } from "vitest";
import { CATEGORIES, getScoreLevelLabel, getOptionsForQuestion } from "../shared/questionnaire";

// Test the notification content generation logic

describe("Owner Notification - New User Registration", () => {
  it("should format new user registration notification content correctly", () => {
    const userName = "Jane Smith";
    const userEmail = "jane@example.com";
    const loginMethod = "google";
    const registeredAt = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" });

    const title = `New User Registration: ${userName}`;
    const content = `A new user has registered on Health, Wellness & Vitality.\n\nName: ${userName}\nEmail: ${userEmail}\nLogin Method: ${loginMethod}\nRegistered: ${registeredAt}`;

    expect(title).toBe("New User Registration: Jane Smith");
    expect(content).toContain("Jane Smith");
    expect(content).toContain("jane@example.com");
    expect(content).toContain("google");
    expect(content).toContain("Health, Wellness & Vitality");
  });

  it("should handle missing name gracefully", () => {
    const userName = "Unknown";
    const title = `New User Registration: ${userName}`;
    expect(title).toBe("New User Registration: Unknown");
  });

  it("should handle missing email gracefully", () => {
    const userEmail = "No email provided";
    const content = `A new user has registered on Health, Wellness & Vitality.\n\nName: Test\nEmail: ${userEmail}\nLogin Method: email\nRegistered: now`;
    expect(content).toContain("No email provided");
  });
});

describe("Owner Notification - First Evaluation with Detailed Breakdown", () => {
  // Helper that mirrors the notification content generation in routers.ts
  function buildEvaluationNotification(
    userName: string,
    userEmail: string,
    overallScore: number,
    cardiacFlag: number,
    categoryScores: Record<string, number>,
    responses: Record<string, number>
  ): { title: string; content: string } {
    const scoreLevelLabel = getScoreLevelLabel(overallScore);

    const categoryBreakdown = CATEGORIES.map((cat) => {
      const catScore = categoryScores[cat.id];
      const scoreLabel = getScoreLevelLabel(catScore ?? 0);
      const questionDetails = cat.questions.map((q) => {
        const responseValue = responses[q.id];
        const options = getOptionsForQuestion(q);
        const selectedOption = options.find((o) => o.value === responseValue);
        const answerLabel = selectedOption ? selectedOption.label : `${responseValue ?? "N/A"}`;
        return `  - ${q.text}: ${answerLabel} (${responseValue ?? "N/A"}/5)`;
      }).join("\n");
      return `📊 ${cat.name}: ${Math.round(catScore ?? 0)}% (${scoreLabel})\n${questionDetails}`;
    }).join("\n\n");

    const title = `First Evaluation Completed: ${userName}`;
    const content = `${userName} (${userEmail}) has completed their first wellness evaluation!\n\n` +
      `🏆 Overall Score: ${Math.round(overallScore)}% (${scoreLevelLabel})\n` +
      `${cardiacFlag ? "⚠️ Cardiac flag detected\n" : ""}` +
      `\n--- Category Breakdown & Responses ---\n\n${categoryBreakdown}\n\n` +
      `This is a great opportunity to reach out and offer personalised coaching support.`;

    return { title, content };
  }

  it("should include overall score and score level", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 70;
      cat.questions.forEach((q) => { responses[q.id] = 4; });
    });

    const { title, content } = buildEvaluationNotification(
      "Jane Smith", "jane@example.com", 70, 0, categoryScores, responses
    );

    expect(title).toBe("First Evaluation Completed: Jane Smith");
    expect(content).toContain("🏆 Overall Score: 70% (Strong)");
    expect(content).toContain("personalised coaching support");
  });

  it("should include all category names in the breakdown", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 60;
      cat.questions.forEach((q) => { responses[q.id] = 3; });
    });

    const { content } = buildEvaluationNotification(
      "Test User", "test@example.com", 60, 0, categoryScores, responses
    );

    CATEGORIES.forEach((cat) => {
      expect(content).toContain(cat.name);
    });
  });

  it("should include individual question text and answer labels", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 80;
      cat.questions.forEach((q) => { responses[q.id] = 4; });
    });

    const { content } = buildEvaluationNotification(
      "Test User", "test@example.com", 80, 0, categoryScores, responses
    );

    // Check that at least the first question from each category appears
    CATEGORIES.forEach((cat) => {
      const firstQ = cat.questions[0];
      expect(content).toContain(firstQ.text);
    });

    // Check that answer values appear in the format (value/5)
    expect(content).toContain("(4/5)");
  });

  it("should show category scores with correct score level labels", () => {
    const categoryScores: Record<string, number> = {
      [CATEGORIES[0].id]: 85,  // Strong
      [CATEGORIES[1].id]: 55,  // Developing
      [CATEGORIES[2].id]: 25,  // Needs Attention
    };
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      cat.questions.forEach((q) => { responses[q.id] = 3; });
    });

    const { content } = buildEvaluationNotification(
      "Test User", "test@example.com", 55, 0, categoryScores, responses
    );

    expect(content).toContain(`${CATEGORIES[0].name}: 85% (Strong)`);
    expect(content).toContain(`${CATEGORIES[1].name}: 55% (Developing)`);
    expect(content).toContain(`${CATEGORIES[2].name}: 25% (Needs Attention)`);
  });

  it("should include cardiac flag warning when present", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 40;
      cat.questions.forEach((q) => { responses[q.id] = 2; });
    });

    const { content } = buildEvaluationNotification(
      "John Doe", "john@example.com", 40, 1, categoryScores, responses
    );

    expect(content).toContain("⚠️ Cardiac flag detected");
  });

  it("should NOT include cardiac flag when not present", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 80;
      cat.questions.forEach((q) => { responses[q.id] = 4; });
    });

    const { content } = buildEvaluationNotification(
      "Jane Smith", "jane@example.com", 80, 0, categoryScores, responses
    );

    expect(content).not.toContain("Cardiac flag");
  });

  it("should handle missing response values gracefully with N/A", () => {
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 0;
      // Leave responses empty - don't set any
    });

    const { content } = buildEvaluationNotification(
      "Incomplete User", "inc@example.com", 0, 0, categoryScores, responses
    );

    expect(content).toContain("N/A");
  });

  it("should correctly identify score levels", () => {
    expect(getScoreLevelLabel(85)).toBe("Strong");
    expect(getScoreLevelLabel(55)).toBe("Developing");
    expect(getScoreLevelLabel(25)).toBe("Needs Attention");
  });

  it("should determine first evaluation correctly based on evaluation count", () => {
    const evalCounts = [
      { count: 0, expected: true },
      { count: 1, expected: true },
      { count: 2, expected: false },
      { count: 5, expected: false },
    ];

    evalCounts.forEach(({ count, expected }) => {
      const isFirstEvaluation = count <= 1;
      expect(isFirstEvaluation).toBe(expected);
    });
  });
});

describe("Notification payload validation", () => {
  it("should ensure detailed notification content is within length limits", () => {
    const CONTENT_MAX_LENGTH = 20000;

    // Build a full notification to check its length
    const categoryScores: Record<string, number> = {};
    const responses: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryScores[cat.id] = 60;
      cat.questions.forEach((q) => { responses[q.id] = 3; });
    });

    const categoryBreakdown = CATEGORIES.map((cat) => {
      const catScore = categoryScores[cat.id];
      const scoreLabel = getScoreLevelLabel(catScore ?? 0);
      const questionDetails = cat.questions.map((q) => {
        const responseValue = responses[q.id];
        const options = getOptionsForQuestion(q);
        const selectedOption = options.find((o) => o.value === responseValue);
        const answerLabel = selectedOption ? selectedOption.label : `${responseValue ?? "N/A"}`;
        return `  - ${q.text}: ${answerLabel} (${responseValue ?? "N/A"}/5)`;
      }).join("\n");
      return `📊 ${cat.name}: ${Math.round(catScore ?? 0)}% (${scoreLabel})\n${questionDetails}`;
    }).join("\n\n");

    const fullContent = `Test User (test@example.com) has completed their first wellness evaluation!\n\n` +
      `🏆 Overall Score: 60% (Developing)\n` +
      `\n--- Category Breakdown & Responses ---\n\n${categoryBreakdown}\n\n` +
      `This is a great opportunity to reach out and offer personalised coaching support.`;

    expect(fullContent.length).toBeLessThanOrEqual(CONTENT_MAX_LENGTH);
    // Verify it's substantial (has real content)
    expect(fullContent.length).toBeGreaterThan(500);
  });
});
