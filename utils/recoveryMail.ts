import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { AWSSecretsRetrieval } from "../services/AWSSecretsRetrieval.js";

interface MailOptions {
  from: string | undefined;
  to: string;
  subject: string;
  text: string;
}

interface SendRecoveryEmail {
  (email: string, tempPassword: string): Promise<void>;
}

export const sendRecoveryEmail: SendRecoveryEmail = async (
  email,
  tempPassword,
) => {
  const {
    MAIL_USERNAME,
    MAIL_PASSWORD,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN,
  } = await AWSSecretsRetrieval();

  const mailOptions: MailOptions = {
    from: MAIL_USERNAME,
    to: email,
    subject: "Password Recovery",
    text: `Use this temporary password to login: ${tempPassword}`,
  };

  try {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
        clientId: OAUTH_CLIENT_ID,
        clientSecret: OAUTH_CLIENT_SECRET,
        refreshToken: OAUTH_REFRESH_TOKEN,
      },
    } as SMTPTransport.Options);

    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error creating transporter", error);
  }
};
