import { describe, it, expect } from "vitest";
import {
  HEALTH_HISTORY_QUESTIONS,
  getVisibleHealthHistoryQuestions,
  formatHealthHistorySummary,
} from "../shared/questionnaire";

describe("HEALTH_HISTORY_QUESTIONS", () => {
  it("should have questions defined", () => {
    expect(HEALTH_HISTORY_QUESTIONS.length).toBeGreaterThan(0);
  });

  it("every question should have id, text, and options", () => {
    for (const q of HEALTH_HISTORY_QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(q.options.length).toBeGreaterThan(0);
      for (const opt of q.options) {
        expect(typeof opt.value).toBe("number");
        expect(opt.label).toBeTruthy();
      }
    }
  });

  it("all question IDs should start with health_", () => {
    for (const q of HEALTH_HISTORY_QUESTIONS) {
      expect(q.id.startsWith("health_")).toBe(true);
    }
  });
});

describe("getVisibleHealthHistoryQuestions — universal questions", () => {
  it("should show COVID vaccination question for any gender/age", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 25 }, {});
    const covidQ = visible.find((q) => q.id === "health_covid_vaccination");
    expect(covidQ).toBeDefined();
  });

  it("should show antibiotics question for any gender/age", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 30 }, {});
    const abQ = visible.find((q) => q.id === "health_antibiotics");
    expect(abQ).toBeDefined();
  });

  it("should show meals per day question for any gender/age", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 50 }, {});
    const mealsQ = visible.find((q) => q.id === "health_meals_per_day");
    expect(mealsQ).toBeDefined();
  });

  it("should show bowel movements question for any gender/age", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 60 }, {});
    const bowelQ = visible.find((q) => q.id === "health_bowel_movements");
    expect(bowelQ).toBeDefined();
  });
});

describe("getVisibleHealthHistoryQuestions — COVID follow-up", () => {
  it("should show COVID doses question when user answered yes to vaccination", () => {
    const responses = { health_covid_vaccination: 1 }; // 1 = Yes
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 30 }, responses);
    const dosesQ = visible.find((q) => q.id === "health_covid_doses");
    expect(dosesQ).toBeDefined();
  });

  it("should NOT show COVID doses question when user answered no to vaccination", () => {
    const responses = { health_covid_vaccination: 2 }; // 2 = No
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 30 }, responses);
    const dosesQ = visible.find((q) => q.id === "health_covid_doses");
    expect(dosesQ).toBeUndefined();
  });
});

describe("getVisibleHealthHistoryQuestions — antibiotics follow-up", () => {
  it("should show antibiotics count when user answered yes", () => {
    const responses = { health_antibiotics: 1 }; // 1 = Yes
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 40 }, responses);
    const freqQ = visible.find((q) => q.id === "health_antibiotics_count");
    expect(freqQ).toBeDefined();
  });

  it("should NOT show antibiotics count when user answered no", () => {
    const responses = { health_antibiotics: 2 }; // 2 = No
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 40 }, responses);
    const freqQ = visible.find((q) => q.id === "health_antibiotics_count");
    expect(freqQ).toBeUndefined();
  });
});

describe("getVisibleHealthHistoryQuestions — female-specific (over 40)", () => {
  it("should show menopause status for female over 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 45 }, {});
    const menoQ = visible.find((q) => q.id === "health_menopause_status");
    expect(menoQ).toBeDefined();
  });

  it("should NOT show menopause status for female under 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 35 }, {});
    const menoQ = visible.find((q) => q.id === "health_menopause_status");
    expect(menoQ).toBeUndefined();
  });

  it("should NOT show menopause status for male over 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 50 }, {});
    const menoQ = visible.find((q) => q.id === "health_menopause_status");
    expect(menoQ).toBeUndefined();
  });

  it("should show menses regularity when pre-menopausal", () => {
    const responses = { health_menopause_status: 1 }; // 1 = Pre-menopausal
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 45 }, responses);
    const mensesQ = visible.find((q) => q.id === "health_menses_regularity");
    expect(mensesQ).toBeDefined();
  });

  it("should show contraceptive question when pre-menopausal", () => {
    const responses = { health_menopause_status: 1 }; // 1 = Pre-menopausal
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 45 }, responses);
    const contraQ = visible.find((q) => q.id === "health_contraceptive_pill");
    expect(contraQ).toBeDefined();
  });

  it("should show menopause symptoms when peri-menopausal", () => {
    const responses = { health_menopause_status: 2 }; // 2 = Peri-menopausal
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 50 }, responses);
    const sympQ = visible.find((q) => q.id === "health_menopause_symptoms");
    expect(sympQ).toBeDefined();
  });

  it("should NOT show menses/contraceptive when peri-menopausal", () => {
    const responses = { health_menopause_status: 2 }; // 2 = Peri-menopausal
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 50 }, responses);
    expect(visible.find((q) => q.id === "health_menses_regularity")).toBeUndefined();
    expect(visible.find((q) => q.id === "health_contraceptive_pill")).toBeUndefined();
  });

  it("should show post-menopause symptoms question when post-menopausal", () => {
    const responses = { health_menopause_status: 3 }; // 3 = Post-menopausal
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 55 }, responses);
    const postQ = visible.find((q) => q.id === "health_postmenopause_symptoms");
    expect(postQ).toBeDefined();
  });
});

describe("getVisibleHealthHistoryQuestions — male-specific (over 40)", () => {
  it("should show nighttime urination for male over 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 50 }, {});
    const urinQ = visible.find((q) => q.id === "health_night_urination");
    expect(urinQ).toBeDefined();
  });

  it("should NOT show nighttime urination for male under 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "male", age: 35 }, {});
    const urinQ = visible.find((q) => q.id === "health_night_urination");
    expect(urinQ).toBeUndefined();
  });

  it("should NOT show nighttime urination for female over 40", () => {
    const visible = getVisibleHealthHistoryQuestions({ gender: "female", age: 50 }, {});
    const urinQ = visible.find((q) => q.id === "health_night_urination");
    expect(urinQ).toBeUndefined();
  });
});

describe("getVisibleHealthHistoryQuestions — no demographics", () => {
  it("should return universal questions when no gender/age provided", () => {
    const visible = getVisibleHealthHistoryQuestions({}, {});
    // Should have at least the universal questions
    expect(visible.length).toBeGreaterThan(0);
    // Should NOT have gender-specific questions
    expect(visible.find((q) => q.id === "health_menopause_status")).toBeUndefined();
    expect(visible.find((q) => q.id === "health_nighttime_urination")).toBeUndefined();
  });
});

describe("formatHealthHistorySummary", () => {
  it("should format answered health history questions", () => {
    const responses: Record<string, number> = {
      health_covid_vaccination: 1,
      health_covid_doses: 2,
      health_antibiotics: 2,
      health_meals_per_day: 3,
      health_bowel_movements: 1,
    };
    const summary = formatHealthHistorySummary({ gender: "male", age: 30 }, responses);
    expect(summary).toContain("→");
    expect(summary.split("\n").length).toBeGreaterThan(0);
  });

  it("should return fallback message when no health history data", () => {
    const summary = formatHealthHistorySummary({}, {});
    expect(summary).toBe("No health history data provided.");
  });

  it("should include female-specific answers when present", () => {
    const responses: Record<string, number> = {
      health_menopause_status: 2, // peri-menopausal
      health_menopause_symptoms: 3, // moderate
      health_covid_vaccination: 2,
      health_antibiotics: 2,
      health_meals_per_day: 3,
      health_bowel_movements: 2,
    };
    const summary = formatHealthHistorySummary({ gender: "female", age: 50 }, responses);
    expect(summary.toLowerCase()).toContain("menopaus");
  });
});
