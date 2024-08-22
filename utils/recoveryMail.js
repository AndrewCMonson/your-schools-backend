import { createTransport } from "nodemailer";
export const sendRecoveryEmail = async (email, tempPassword) => {
    const mailOptions = {
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
        });
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error creating transporter", error);
    }
};
