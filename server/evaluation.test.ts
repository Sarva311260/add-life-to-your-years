import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  calculateCategoryScore,
  calculateOverallScore,
  getScoreLevel,
  getScoreLevelLabel,
  getOptionsForQuestion,
  hasCardiacFlag,
  getCategoryById,
} from "../shared/questionnaire";

describe("questionnaire data", () => {
  it("has exactly 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("each category has an id, name, description, and at least 3 questions", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.questions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("each question has an id, text, and type", () => {
    CATEGORIES.forEach((cat) => {
      cat.questions.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(q.text).toBeTruthy();
        expect(["scale", "yesno", "choice", "frequency"]).toContain(q.type);
      });
    });
  });

  it("all question IDs are unique", () => {
    const allIds = CATEGORIES.flatMap((cat) => cat.questions.map((q) => q.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("getOptionsForQuestion returns options for all question types", () => {
    CATEGORIES.forEach((cat) => {
      cat.questions.forEach((q) => {
        const options = getOptionsForQuestion(q);
        expect(options.length).toBeGreaterThan(0);
        options.forEach((opt) => {
          expect(typeof opt.value).toBe("number");
          expect(typeof opt.label).toBe("string");
        });
      });
    });
  });

  it("getCategoryById returns correct category", () => {
    const cat = getCategoryById("lifestyle");
    expect(cat).toBeDefined();
    expect(cat?.name).toBe("Lifestyle Choices");
  });

  it("getCategoryById returns undefined for unknown id", () => {
    expect(getCategoryById("nonexistent")).toBeUndefined();
  });
});

describe("calculateCategoryScore", () => {
  it("returns 0 for empty array", () => {
    expect(calculateCategoryScore([])).toBe(0);
  });

  it("returns 100 for all max scores", () => {
    expect(calculateCategoryScore([5, 5, 5, 5, 5])).toBe(100);
  });

  it("returns 20 for all min scores", () => {
    expect(calculateCategoryScore([1, 1, 1, 1, 1])).toBe(20);
  });

  it("returns 60 for all middle scores", () => {
    expect(calculateCategoryScore([3, 3, 3, 3, 3])).toBe(60);
  });

  it("calculates correctly for mixed scores", () => {
    // (1+2+3+4+5) = 15, max = 25, 15/25 = 0.6 = 60%
    expect(calculateCategoryScore([1, 2, 3, 4, 5])).toBe(60);
  });
});

describe("calculateOverallScore", () => {
  it("returns 0 for empty object", () => {
    expect(calculateOverallScore({})).toBe(0);
  });

  it("returns average of category scores", () => {
    expect(calculateOverallScore({ a: 80, b: 60 })).toBe(70);
  });

  it("rounds to nearest integer", () => {
    expect(calculateOverallScore({ a: 33, b: 67 })).toBe(50);
  });
});

describe("getScoreLevel", () => {
  it("returns low for scores below 40", () => {
    expect(getScoreLevel(0)).toBe("low");
    expect(getScoreLevel(20)).toBe("low");
    expect(getScoreLevel(39)).toBe("low");
  });

  it("returns medium for scores 40-69", () => {
    expect(getScoreLevel(40)).toBe("medium");
    expect(getScoreLevel(55)).toBe("medium");
    expect(getScoreLevel(69)).toBe("medium");
  });

  it("returns high for scores 70+", () => {
    expect(getScoreLevel(70)).toBe("high");
    expect(getScoreLevel(85)).toBe("high");
    expect(getScoreLevel(100)).toBe("high");
  });
});

describe("getScoreLevelLabel", () => {
  it("returns correct labels", () => {
    expect(getScoreLevelLabel(20)).toBe("Needs Attention");
    expect(getScoreLevelLabel(50)).toBe("Developing");
    expect(getScoreLevelLabel(80)).toBe("Strong");
  });
});

describe("hasCardiacFlag", () => {
  it("returns false when gen_6 is not answered", () => {
    expect(hasCardiacFlag({})).toBe(false);
  });

  it("returns false when gen_6 has non-flag value", () => {
    // gen_6 flag trigger values are typically [1] (Yes, personal or family history)
    // We need to check the actual question
    const gen6Question = CATEGORIES.find((c) => c.id === "genetic")?.questions.find((q) => q.id === "gen_6");
    if (gen6Question?.flagTriggerValues) {
      // Use a value that is NOT in the trigger list
      const nonTrigger = [1, 2, 3, 4, 5].find((v) => !gen6Question.flagTriggerValues!.includes(v));
      if (nonTrigger !== undefined) {
        expect(hasCardiacFlag({ gen_6: nonTrigger })).toBe(false);
      }
    }
  });

  it("returns true when gen_6 has flag trigger value", () => {
    const gen6Question = CATEGORIES.find((c) => c.id === "genetic")?.questions.find((q) => q.id === "gen_6");
    if (gen6Question?.flagTriggerValues && gen6Question.flagTriggerValues.length > 0) {
      expect(hasCardiacFlag({ gen_6: gen6Question.flagTriggerValues[0] })).toBe(true);
    }
  });
});
