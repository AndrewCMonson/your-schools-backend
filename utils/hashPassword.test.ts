import { hashPassword } from "./hashPassword.js";
import { describe, expect, it } from "vitest";

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const password = "password";
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).not.toBe(password);
  });
});
