import { sendEmail } from "../../Services/emailServices";
import { forgotPasswordTemplate } from "../MailTemplates/forgotPasswordEmail";

export const sendForgotPasswordEmail = async (email: string, url: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev
    ? "http://localhost:1507"
    : process.env.REACT_APP_BASE_URL2 || process.env.REACT_APP_BASE_URL;


  await sendEmail({
    to: email,
    subject: "Codespace - Forgot Password",
    html: forgotPasswordTemplate(url),
  });
};
