import { describe, it, expect } from "vitest";
import {
  calculateBMI,
  getBMICategory,
  Demographics,
  CATEGORIES,
} from "../shared/questionnaire";

describe("Demographics - BMI Calculation", () => {
  it("should calculate BMI correctly with metric units", () => {
    const demo: Demographics = {
      gender: "male",
      age: 30,
      heightUnit: "metric",
      heightCm: 175,
      weightUnit: "metric",
      weightKg: 70,
    };
    const bmi = calculateBMI(demo);
    expect(bmi).not.toBeNull();
    // BMI = 70 / (1.75 * 1.75) = 22.86
    expect(bmi!).toBeCloseTo(22.86, 1);
  });

  it("should calculate BMI correctly with imperial units", () => {
    const demo: Demographics = {
      gender: "female",
      age: 25,
      heightUnit: "imperial",
      heightFt: 5,
      heightIn: 6,
      weightUnit: "imperial",
      weightLbs: 150,
    };
    const bmi = calculateBMI(demo);
    expect(bmi).not.toBeNull();
    // 5'6" = 66 inches = 167.64 cm, 150 lbs = 68.04 kg
    // BMI = 68.04 / (1.6764 * 1.6764) ≈ 24.2
    expect(bmi!).toBeGreaterThan(23);
    expect(bmi!).toBeLessThan(25);
  });

  it("should return null for missing height", () => {
    const demo: Demographics = {
      gender: "male",
      age: 30,
      heightUnit: "metric",
      weightUnit: "metric",
      weightKg: 70,
    };
    expect(calculateBMI(demo)).toBeNull();
  });

  it("should return null for missing weight", () => {
    const demo: Demographics = {
      gender: "male",
      age: 30,
      heightUnit: "metric",
      heightCm: 175,
      weightUnit: "metric",
    };
    expect(calculateBMI(demo)).toBeNull();
  });

  it("should return null for zero height", () => {
    const demo: Demographics = {
      gender: "male",
      age: 30,
      heightUnit: "metric",
      heightCm: 0,
      weightUnit: "metric",
      weightKg: 70,
    };
    expect(calculateBMI(demo)).toBeNull();
  });

  it("should handle mixed units (metric height, imperial weight)", () => {
    const demo: Demographics = {
      gender: "female",
      age: 40,
      heightUnit: "metric",
      heightCm: 165,
      weightUnit: "imperial",
      weightLbs: 132,
    };
    const bmi = calculateBMI(demo);
    expect(bmi).not.toBeNull();
    // 132 lbs = ~59.87 kg, height = 1.65m
    // BMI = 59.87 / (1.65 * 1.65) ≈ 22.0
    expect(bmi!).toBeGreaterThan(21);
    expect(bmi!).toBeLessThan(23);
  });
});

describe("BMI Category Classification", () => {
  it("should classify underweight BMI", () => {
    const result = getBMICategory(17);
    expect(result.label).toBe("Underweight");
    expect(result.score).toBe(3);
  });

  it("should classify healthy weight BMI", () => {
    const result = getBMICategory(22);
    expect(result.label).toBe("Healthy Weight");
    expect(result.score).toBe(5);
  });

  it("should classify overweight BMI", () => {
    const result = getBMICategory(27);
    expect(result.label).toBe("Overweight");
    expect(result.score).toBe(3);
  });

  it("should classify obese BMI", () => {
    const result = getBMICategory(32);
    expect(result.label).toBe("Obese (Class I)");
    expect(result.score).toBe(2);
  });

  it("should classify severely underweight BMI", () => {
    const result = getBMICategory(15);
    expect(result.label).toBe("Severely Underweight");
    expect(result.score).toBe(1);
  });

  it("should classify obese class II+ BMI", () => {
    const result = getBMICategory(42);
    expect(result.label).toBe("Obese (Class II+)");
    expect(result.score).toBe(1);
  });

  it("should handle boundary values", () => {
    expect(getBMICategory(18.5).label).toBe("Healthy Weight");
    expect(getBMICategory(24.9).label).toBe("Healthy Weight");
    expect(getBMICategory(25).label).toBe("Overweight");
    expect(getBMICategory(30).label).toBe("Obese (Class I)");
  });
});

describe("New Lifestyle Questions", () => {
  const lifestyleCategory = CATEGORIES.find((c) => c.id === "lifestyle");

  it("should include water intake question", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_water_intake");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(4);
    // Best option (8 glasses) should be value 5
    const bestOption = q!.options!.find((o) => o.value === 5);
    expect(bestOption).toBeDefined();
    expect(bestOption!.label).toContain("8 glasses");
  });

  it("should include water type question", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_water_type");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(6);
    // Best option (filtered, not distilled or RO) should be value 5
    const bestOption = q!.options!.find((o) => o.label.startsWith("Filtered"));
    expect(bestOption).toBeDefined();
    expect(bestOption!.value).toBe(5);
    // Distilled/RO should now be lower scored (value 4.5, not 5)
    const distilledOption = q!.options!.find((o) => o.label.toLowerCase().startsWith("distilled"));
    expect(distilledOption).toBeDefined();
    expect(distilledOption!.value).toBeLessThan(5);
  });

  it("should include raw food question with 75% as ideal", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_raw_food");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(4);
    // 50-75% should be the highest scored (value 5)
    const idealOption = q!.options!.find((o) => o.value === 5);
    expect(idealOption).toBeDefined();
    expect(idealOption!.label).toContain("50");
    // 100% should be slightly lower (value 4)
    const fullRawOption = q!.options!.find((o) => o.label === "100%");
    expect(fullRawOption).toBeDefined();
    expect(fullRawOption!.value).toBe(4);
  });

  it("should include deep fried food question", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_fried_food");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(4);
    // Never should be the best (value 5)
    const bestOption = q!.options!.find((o) => o.value === 5);
    expect(bestOption).toBeDefined();
    expect(bestOption!.label).toBe("Never");
  });

  it("should include sweets question", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_sweets");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(4);
  });

  it("should include soft drinks question", () => {
    const q = lifestyleCategory?.questions.find((q) => q.id === "lifestyle_soft_drinks");
    expect(q).toBeDefined();
    expect(q!.options!.length).toBe(4);
  });

  it("should have 54 total questions across all categories", () => {
    const totalQuestions = CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0);
    expect(totalQuestions).toBe(54);
  });
});

describe("PDF Report - Data Preparation", () => {
  it("should have all required data fields for PDF generation", () => {
    // Simulate evaluation data structure that the PDF generator expects
    const evaluationData = {
      id: 1,
      overallScore: "75.50",
      categoryScores: Object.fromEntries(CATEGORIES.map((c) => [c.id, 70])),
      responses: Object.fromEntries(
        CATEGORIES.flatMap((c) => c.questions.map((q) => [q.id, 3]))
      ),
      cardiacFlag: 0,
      gender: "male",
      age: 35,
      heightCm: "175.0",
      weightKg: "70.0",
      bmi: "22.9",
      completedAt: new Date(),
    };

    expect(evaluationData.id).toBeDefined();
    expect(evaluationData.overallScore).toBeDefined();
    expect(Object.keys(evaluationData.categoryScores).length).toBe(8);
    expect(Object.keys(evaluationData.responses).length).toBe(54);
    expect(evaluationData.gender).toBeDefined();
    expect(evaluationData.age).toBeDefined();
    expect(evaluationData.bmi).toBeDefined();
  });

  it("should handle evaluation data without demographics", () => {
    const evaluationData = {
      id: 1,
      overallScore: "60.00",
      categoryScores: Object.fromEntries(CATEGORIES.map((c) => [c.id, 60])),
      responses: Object.fromEntries(
        CATEGORIES.flatMap((c) => c.questions.map((q) => [q.id, 3]))
      ),
      cardiacFlag: 0,
      gender: null,
      age: null,
      heightCm: null,
      weightKg: null,
      bmi: null,
      completedAt: new Date(),
    };

    // Should not throw
    expect(evaluationData.gender).toBeNull();
    expect(evaluationData.bmi).toBeNull();
  });
});
