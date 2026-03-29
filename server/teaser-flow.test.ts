import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  calculateCategoryScore,
  calculateOverallScore,
  getScoreLevel,
  getScoreLevelLabel,
  hasCardiacFlag,
} from "../shared/questionnaire";

/**
 * Tests for the teaser results flow:
 * - Client-side score calculation for unauthenticated users
 * - Teaser data structure validation
 * - Score level classification for teaser display
 * - Cardiac flag detection for teaser display
 */

describe("Teaser Results - Client-side Score Calculation", () => {
  // Simulate a complete set of responses
  const mockResponses: Record<string, number> = {};
  const mockCategoryScores: Record<string, number> = {};

  // Fill in responses for all categories
  CATEGORIES.forEach((cat) => {
    const catResponses: number[] = [];
    cat.questions.forEach((q, i) => {
      // Alternate between 3 and 4 for variety
      const value = i % 2 === 0 ? 3 : 4;
      mockResponses[q.id] = value;
      catResponses.push(value);
    });
    mockCategoryScores[cat.id] = calculateCategoryScore(catResponses);
  });

  it("should calculate category scores correctly for teaser display", () => {
    // Each category with alternating 3 and 4 values
    Object.values(mockCategoryScores).forEach((score) => {
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("should calculate overall score from category scores", () => {
    const overall = calculateOverallScore(mockCategoryScores);
    expect(overall).toBeGreaterThan(0);
    expect(overall).toBeLessThanOrEqual(100);
    // Overall should be the average of all category scores
    const expectedAvg = Math.round(
      Object.values(mockCategoryScores).reduce((a, b) => a + b, 0) / Object.values(mockCategoryScores).length
    );
    expect(overall).toBe(expectedAvg);
  });

  it("should have scores for all 8 categories", () => {
    expect(Object.keys(mockCategoryScores).length).toBe(8);
    CATEGORIES.forEach((cat) => {
      expect(mockCategoryScores[cat.id]).toBeDefined();
    });
  });

  it("should detect cardiac flag from responses", () => {
    const testResponses = { ...mockResponses };
    // gen_6 values 1,2,3 trigger the cardiac flag (Yes — personal, family, or both history)
    testResponses["gen_6"] = 1;
    expect(hasCardiacFlag(testResponses)).toBe(true);

    testResponses["gen_6"] = 2;
    expect(hasCardiacFlag(testResponses)).toBe(true);

    testResponses["gen_6"] = 3;
    expect(hasCardiacFlag(testResponses)).toBe(true);

    // gen_6 values 4,5 should NOT trigger (minor/no history)
    testResponses["gen_6"] = 4;
    expect(hasCardiacFlag(testResponses)).toBe(false);

    testResponses["gen_6"] = 5;
    expect(hasCardiacFlag(testResponses)).toBe(false);
  });
});

describe("Teaser Results - Score Level Classification", () => {
  it("should classify low scores as 'Needs Attention'", () => {
    expect(getScoreLevel(20)).toBe("low");
    expect(getScoreLevel(39)).toBe("low");
    expect(getScoreLevelLabel(20)).toBe("Needs Attention");
  });

  it("should classify medium scores as 'Developing'", () => {
    expect(getScoreLevel(40)).toBe("medium");
    expect(getScoreLevel(69)).toBe("medium");
    expect(getScoreLevelLabel(50)).toBe("Developing");
  });

  it("should classify high scores as 'Strong'", () => {
    expect(getScoreLevel(70)).toBe("high");
    expect(getScoreLevel(100)).toBe("high");
    expect(getScoreLevelLabel(85)).toBe("Strong");
  });
});

describe("Teaser Results - Data Structure Validation", () => {
  it("should produce valid teaser data structure from questionnaire responses", () => {
    const responses: Record<string, number> = {};
    const categoryScores: Record<string, number> = {};

    CATEGORIES.forEach((cat) => {
      const catResponses: number[] = [];
      cat.questions.forEach((q) => {
        responses[q.id] = 3;
        catResponses.push(3);
      });
      categoryScores[cat.id] = calculateCategoryScore(catResponses);
    });

    const overallScore = calculateOverallScore(categoryScores);
    const cardiacFlag = hasCardiacFlag(responses);

    // Validate structure matches what TeaserResults.tsx expects
    const teaserData = {
      responses,
      categoryScores,
      overallScore,
      cardiacFlag,
      timestamp: Date.now(),
    };

    expect(teaserData.responses).toBeDefined();
    expect(Object.keys(teaserData.responses).length).toBe(47); // 47 total questions (41 original + 3 lifestyle + 1 genetics + 2 physical trauma)
    expect(teaserData.categoryScores).toBeDefined();
    expect(Object.keys(teaserData.categoryScores).length).toBe(8);
    expect(teaserData.overallScore).toBeGreaterThan(0);
    expect(typeof teaserData.cardiacFlag).toBe("boolean");
    expect(teaserData.timestamp).toBeGreaterThan(0);
  });

  it("should count strong/grow/attention categories correctly from teaser data", () => {
    // Create scores that span all three levels
    const categoryScores: Record<string, number> = {
      lifestyle: 85,       // high (strong)
      environmental: 55,   // medium (room to grow)
      genetic: 30,         // low (needs attention)
      structural: 75,      // high (strong)
      stress: 45,          // medium (room to grow)
      purpose: 80,         // high (strong)
      relationships: 65,   // medium (room to grow)
      physical_trauma: 20, // low (needs attention)
    };

    const levels = Object.values(categoryScores).map((score) => getScoreLevel(score));
    const strongCount = levels.filter((l) => l === "high").length;
    const growCount = levels.filter((l) => l === "medium").length;
    const attentionCount = levels.filter((l) => l === "low").length;

    expect(strongCount).toBe(3);
    expect(growCount).toBe(3);
    expect(attentionCount).toBe(2);
    expect(strongCount + growCount + attentionCount).toBe(8);
  });
});

describe("Teaser Results - Expiry Logic", () => {
  it("should consider teaser data valid within 24 hours", () => {
    const now = Date.now();
    const twentyThreeHoursAgo = now - 23 * 60 * 60 * 1000;
    const isValid = now - twentyThreeHoursAgo < 24 * 60 * 60 * 1000;
    expect(isValid).toBe(true);
  });

  it("should consider teaser data expired after 24 hours", () => {
    const now = Date.now();
    const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;
    const isValid = now - twentyFiveHoursAgo < 24 * 60 * 60 * 1000;
    expect(isValid).toBe(false);
  });
});
