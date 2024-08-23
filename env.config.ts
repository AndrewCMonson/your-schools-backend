import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Secret } from "jsonwebtoken";

interface AWSSecrets {
  MONGO_URI: string;
  JWT_SECRET: Secret;
  JWT_EXPIRATION: string;
  SESSION_SECRET: string;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  OAUTH_REFRESH_TOKEN: string;
  MAIL_USERNAME: string;
  MAIL_PASSWORD: string;
  CLOUDFRONT_URL: string;
}

export const AWSSecretsRetrieval = async () => {
  const SecretId = "YOUR_SCHOOLS_SECRETS";

  const client = new SecretsManagerClient({
    region: "us-east-1",
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId,
        VersionStage: "AWSCURRENT",
      }),
    );
  } catch (error) {
    console.error(error);
    throw error;
  }

  const secret = response.SecretString ?? "undefined";

  const awsSecrets: AWSSecrets = JSON.parse(secret);

  return awsSecrets;
};
