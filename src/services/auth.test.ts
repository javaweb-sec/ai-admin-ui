import { describe, it, expect } from "vitest";
import { signIn, safeRedirect } from "./auth";
describe("demo authentication", () => {
  it("accepts the demo account without returning a password or token", async () => {
    expect(await signIn("admin", "admin123")).toEqual({
      username: "admin",
      displayName: "管理员",
      role: "管理员",
    });
  });
  it("rejects invalid credentials", async () => {
    await expect(signIn("admin", "wrong")).rejects.toThrow();
    await expect(signIn("other", "admin123")).rejects.toThrow();
  });
  it("preserves local deep links", () => {
    expect(safeRedirect("/users?q=test#list")).toBe("/users?q=test#list");
  });
  it("rejects external and login redirects", () => {
    for (const path of [
      undefined,
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "/login",
      "/login?next=/users",
    ])
      expect(safeRedirect(path)).toBe("/dashboard");
  });
});
