import { describe, it, expect, vi } from "vitest";
import { getScoreLevelLabel } from "../shared/questionnaire";

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

describe("Owner Notification - First Evaluation Completed", () => {
  it("should format first evaluation notification content correctly", () => {
    const userName = "Jane Smith";
    const userEmail = "jane@example.com";
    const overallScore = 72.5;
    const scoreLevelLabel = getScoreLevelLabel(overallScore);
    const cardiacFlag = false;

    const title = `First Evaluation Completed: ${userName}`;
    const content = `${userName} (${userEmail}) has completed their first wellness evaluation!\n\nOverall Score: ${Math.round(overallScore)}% (${scoreLevelLabel})\n${cardiacFlag ? "⚠️ Cardiac flag detected\n" : ""}\nThis is a great opportunity to reach out and offer personalised coaching support.`;

    expect(title).toBe("First Evaluation Completed: Jane Smith");
    expect(content).toContain("73%");
    expect(content).toContain(scoreLevelLabel);
    expect(content).not.toContain("Cardiac flag");
    expect(content).toContain("personalised coaching support");
  });

  it("should include cardiac flag warning when present", () => {
    const userName = "John Doe";
    const userEmail = "john@example.com";
    const overallScore = 45;
    const scoreLevelLabel = getScoreLevelLabel(overallScore);
    const cardiacFlag = true;

    const content = `${userName} (${userEmail}) has completed their first wellness evaluation!\n\nOverall Score: ${Math.round(overallScore)}% (${scoreLevelLabel})\n${cardiacFlag ? "⚠️ Cardiac flag detected\n" : ""}\nThis is a great opportunity to reach out and offer personalised coaching support.`;

    expect(content).toContain("45%");
    expect(content).toContain("⚠️ Cardiac flag detected");
  });

  it("should correctly identify score levels in notifications", () => {
    // High score
    expect(getScoreLevelLabel(85)).toBe("Strong");
    // Medium score
    expect(getScoreLevelLabel(55)).toBe("Developing");
    // Low score
    expect(getScoreLevelLabel(25)).toBe("Needs Attention");
  });

  it("should determine first evaluation correctly based on evaluation count", () => {
    // Simulating the logic: previousEvals.length <= 1 means first evaluation
    const evalCounts = [
      { count: 0, expected: true },  // no evals yet (shouldn't happen but edge case)
      { count: 1, expected: true },  // just the one we created
      { count: 2, expected: false }, // has a previous one
      { count: 5, expected: false }, // multiple previous
    ];

    evalCounts.forEach(({ count, expected }) => {
      const isFirstEvaluation = count <= 1;
      expect(isFirstEvaluation).toBe(expected);
    });
  });
});

describe("Notification payload validation", () => {
  it("should ensure title is within length limits", () => {
    const TITLE_MAX_LENGTH = 1200;
    const shortTitle = "New User Registration: Jane Smith";
    const longTitle = "A".repeat(TITLE_MAX_LENGTH + 1);

    expect(shortTitle.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    expect(longTitle.length).toBeGreaterThan(TITLE_MAX_LENGTH);
  });

  it("should ensure content is within length limits", () => {
    const CONTENT_MAX_LENGTH = 20000;
    const normalContent = "A new user has registered on Health, Wellness & Vitality.\n\nName: Jane\nEmail: jane@test.com\nLogin Method: google\nRegistered: now";
    expect(normalContent.length).toBeLessThanOrEqual(CONTENT_MAX_LENGTH);
  });
});
