import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";
export const AWSSecretsRetrieval = async () => {
    const SecretId = "YOUR_SCHOOLS_SECRETS";
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });
    let response;
    try {
        response = await client.send(new GetSecretValueCommand({
            SecretId,
            VersionStage: "AWSCURRENT",
        }));
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    const secret = response.SecretString ?? "undefined";
    const awsSecrets = JSON.parse(secret);
    return awsSecrets;
};
