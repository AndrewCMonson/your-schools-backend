import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

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
  const mailOptions: MailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Recovery",
    text: `Use this temporary password to login: ${tempPassword}`,
  };

  try {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    } as SMTPTransport.Options);

    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error creating transporter", error);
  }
};
