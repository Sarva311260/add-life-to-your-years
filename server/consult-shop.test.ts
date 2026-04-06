import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { HEALTH_CONDITIONS, CONSULTATION_PHASES, BOOK_RECOMMENDATIONS, buildConsultSystemPrompt, buildReportPrompt } from "./consultKnowledge";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-consult",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("consult.getConditions", () => {
  it("returns the list of health conditions for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const conditions = await caller.consult.getConditions();

    expect(conditions).toBeDefined();
    expect(Array.isArray(conditions)).toBe(true);
    expect(conditions.length).toBeGreaterThan(0);

    // Each condition should have id, label, and description
    for (const condition of conditions) {
      expect(condition).toHaveProperty("id");
      expect(condition).toHaveProperty("label");
      expect(condition).toHaveProperty("description");
      expect(typeof condition.id).toBe("string");
      expect(typeof condition.label).toBe("string");
    }
  });

  it("includes common conditions like sleep, gut health, fatigue", () => {
    const conditionIds = HEALTH_CONDITIONS.map((c) => c.id);
    expect(conditionIds).toContain("sleep");
    expect(conditionIds).toContain("gut_health");
    expect(conditionIds).toContain("fatigue");
    expect(conditionIds).toContain("stress");
    expect(conditionIds).toContain("joint_pain");
    expect(conditionIds).toContain("skin");
  });

  it("includes an 'other' option for diagnosed conditions", () => {
    const conditionIds = HEALTH_CONDITIONS.map((c) => c.id);
    expect(conditionIds).toContain("other");
  });
});

describe("consult.getPhases", () => {
  it("returns 6 consultation phases", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const phases = await caller.consult.getPhases();

    expect(phases).toBeDefined();
    expect(Array.isArray(phases)).toBe(true);
    expect(phases.length).toBe(6);
  });

  it("phases have correct structure", () => {
    for (const phase of CONSULTATION_PHASES) {
      expect(phase).toHaveProperty("id");
      expect(phase).toHaveProperty("title");
      expect(phase).toHaveProperty("description");
      expect(typeof phase.id).toBe("number");
      expect(typeof phase.title).toBe("string");
    }
  });
});

describe("consult.checkEvaluation", () => {
  it("returns evaluation status for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consult.checkEvaluation();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("hasEvaluation");
    expect(typeof result.hasEvaluation).toBe("boolean");
    expect(result).toHaveProperty("evaluationId");
    expect(result).toHaveProperty("overallScore");
  });
});

describe("consult.history", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const history = await caller.consult.history();

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("consultKnowledge", () => {
  it("BOOK_RECOMMENDATIONS covers all 17 recommendations", () => {
    expect(BOOK_RECOMMENDATIONS).toBeDefined();
    expect(Array.isArray(BOOK_RECOMMENDATIONS)).toBe(true);
    expect(BOOK_RECOMMENDATIONS.length).toBe(17);
    for (const rec of BOOK_RECOMMENDATIONS) {
      expect(rec).toHaveProperty("id");
      expect(rec).toHaveProperty("title");
      expect(rec).toHaveProperty("category");
    }
  });

  it("HEALTH_CONDITIONS has at least 6 conditions", () => {
    expect(HEALTH_CONDITIONS.length).toBeGreaterThanOrEqual(6);
  });
});

describe("buildConsultSystemPrompt dietary intake", () => {

  it("Phase 2 prompt includes dietary intake question for full review", () => {
    const prompt = buildConsultSystemPrompt(2, "full_review", undefined, undefined, undefined, "John");
    expect(prompt).toContain("breakfast");
    expect(prompt).toContain("lunch");
    expect(prompt).toContain("dinner");
    expect(prompt).toContain("snack");
    expect(prompt).toContain("DIETARY INTAKE");
  });

  it("Phase 2 prompt includes dietary intake question for specific conditions", () => {
    const prompt = buildConsultSystemPrompt(2, "specific_conditions", ["sleep"], undefined, undefined, "Jane");
    expect(prompt).toContain("breakfast");
    expect(prompt).toContain("lunch");
    expect(prompt).toContain("dinner");
    expect(prompt).toContain("snack");
    expect(prompt).toContain("diet is connected to almost every health condition");
  });

  it("Phase 2 prompt with evaluation data still asks about meals", () => {
    const evalSummary = "Overall Score: 65%\nBMI: 24.5\nCategory Scores:\n- Lifestyle Choices: 55%";
    const prompt = buildConsultSystemPrompt(2, "full_review", undefined, evalSummary, undefined, "Sarah");
    expect(prompt).toContain("typical daily meals");
    expect(prompt).toContain("breakfast");
  });

  it("Phase 3 prompt includes dietary follow-up instruction", () => {
    const prompt = buildConsultSystemPrompt(3, "full_review", undefined, undefined, "some context", "Tom");
    expect(prompt).toContain("dietary choices");
    expect(prompt).toContain("processed food");
    expect(prompt).toContain("plant-based");
  });

  it("Report prompt includes Dietary Analysis section", () => {
    const report = buildReportPrompt("full_review", null, "conversation", undefined, "Alex");
    expect(report).toContain("Dietary Analysis");
    expect(report).toContain("breakfast");
    expect(report).toContain("lunch");
    expect(report).toContain("dinner");
  });
});

describe("consult.submitRating", () => {
  it("rejects rating below 1", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.consult.submitRating({ consultationId: 1, reportId: 1, rating: 0 })
    ).rejects.toThrow();
  });

  it("rejects rating above 5", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.consult.submitRating({ consultationId: 1, reportId: 1, rating: 6 })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.consult.submitRating({ consultationId: 1, reportId: 1, rating: 5 })
    ).rejects.toThrow();
  });
});

describe("review.createDonationCheckout", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.createDonationCheckout({ consultationId: 1, amountCents: 1000 })
    ).rejects.toThrow();
  });

  it("rejects amounts below $1", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.createDonationCheckout({ consultationId: 1, amountCents: 50 })
    ).rejects.toThrow();
  });

  it("rejects amounts above $1000", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.createDonationCheckout({ consultationId: 1, amountCents: 200000 })
    ).rejects.toThrow();
  });
});

describe("shop.list", () => {
  it("returns products array for public users (no auth required)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const products = await caller.shop.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("shop.getById", () => {
  it("throws NOT_FOUND for non-existent product", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.shop.getById({ id: 999999 })).rejects.toThrow();
  });
});

describe("shop.create", () => {
  it("rejects non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.shop.create({
        name: "Test Product",
        description: "A test product",
        priceInCents: 1999,
        currency: "AUD",
        sortOrder: 0,
      })
    ).rejects.toThrow("Admin access required");
  });
});
