import { AWSSecretsRetrieval } from "./AWSSecretsRetrieval.js";
import { describe, expect, it } from "vitest";

describe("AWSSecretsRetrieval", () => {
  it("should retrieve secrets from AWS", async () => {
    const secrets = await AWSSecretsRetrieval();
    expect(secrets).toBeDefined();
  });
});
