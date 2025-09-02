// utils/email.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Utility function to send an email with HTML template
 * @param to - Receiver email address
 * @param subject - Email subject
 * @param html - The HTML content (template)
 * @param from - Optional custom sender (defaults to EMAIL_USER)
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) => {
  await transporter.sendMail({
    from: from || `"Codespace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
