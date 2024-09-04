import { sendRecoveryEmail } from "./recoveryMail.js";
import { describe, it, afterAll, expect, vi } from "vitest";

describe("sendRecoveryEmail", () => {
  const consoleMock = vi
    .spyOn(console, "log")
    .mockImplementation(() => undefined);

  afterAll(() => {
    consoleMock.mockReset();
  });

  it("should send a recovery email", async () => {
    const email = "andrewmonson908@gmail.com";
    const tempPassword = "this is a test reset";
    const recoveryEmailInfo = await sendRecoveryEmail(email, tempPassword);

    expect(recoveryEmailInfo.success).toBe(true);
    expect(recoveryEmailInfo.message).toBe(
      "Email sent with temporary password",
    );
    expect(consoleMock).toBeCalledTimes(1);
  });
});
