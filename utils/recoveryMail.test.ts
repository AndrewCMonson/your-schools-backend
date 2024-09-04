import { describe, expect, it } from "vitest";
import { sendRecoveryEmail } from "./recoveryMail.js";

describe("sendRecoveryEmail", () => {
  it("should send a recovery email", async () => {
    const email = "test@test.com";
    const tempPassword = "this is a test reset";
    const recoveryEmailInfo = await sendRecoveryEmail(email, tempPassword);

    expect(recoveryEmailInfo.success).toBe(true);
    expect(recoveryEmailInfo.message).toBe(
      "Email sent with temporary password",
    );
  });

  it("should fail to send a recovery email if the correct parameters are not provided", async () => {
    const email = "";
    const tempPassword = "";
    const recoveryEmailInfo = await sendRecoveryEmail(email, tempPassword);

    expect(recoveryEmailInfo.success).toBe(false);
    expect(recoveryEmailInfo.message).toBe(
      "Email or temporary password not provided",
    );
  });
});
