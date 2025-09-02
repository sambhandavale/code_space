import { sendEmail } from "../../Services/emailServices";
import { confirmationTemplate } from "../MailTemplates/confirmEmail";

export const sendConfirmationEmail = async (email: string, token: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev
    ? "http://localhost:1507"
    : process.env.REACT_APP_BASE_URL2 || process.env.REACT_APP_BASE_URL;

  const url = `${baseUrl}/confirm-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Confirm your Email",
    html: confirmationTemplate(url),
  });
};
