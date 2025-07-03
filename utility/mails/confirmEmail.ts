import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendConfirmationEmail = async (email: string, token: string) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const baseUrl = isDevelopment
    ? "http://localhost:1507"
    : process.env.REACT_APP_BASE_URL2 || process.env.REACT_APP_BASE_URL;

  const url = `${baseUrl}/confirm-email?token=${token}`;

  await transporter.sendMail({
    from: `"Codespace" <${process.env.EMAIL_USER}>`, 
    to: email, 
    subject: "Confirm your Email",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>CodeSpace Email Verification</title>
        <link href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@800&family=Google+Sans&display=swap" rel="stylesheet"/>
        <style>
          body {
            font-family: 'Google Sans', Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .logo {
            font-family: 'Abhaya Libre', serif;
            font-weight: 800;
            font-size: 3rem;
            color: #333;
          }
          a {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
            font-weight: bold;
            color:#fff;
            font-family: 'Google Sans', Arial, sans-serif;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #777;
          }
          h2,p {
            font-family: 'Google Sans', Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to Codespace</h2>
          <p>Please verify your email and activate your account.</p>
          <a href="${url}" class="button">Confirm Email</a>
          <p class="footer">If you didn't sign up, you can safely ignore this email.</p>
        </div>
      </body>
      </html>

    `,
  });
};
