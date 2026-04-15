import { describe, it, expect } from "vitest";

describe("PEMF Admin Password Secret", () => {
  it("should have PEMF_ADMIN_PASSWORD set in environment", () => {
    const password = process.env.PEMF_ADMIN_PASSWORD;
    expect(password).toBeDefined();
    expect(typeof password).toBe("string");
    expect(password!.length).toBeGreaterThan(0);
  });
});
