export const confirmationTemplate = (url: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body { font-family: Arial, sans-serif; background:#f5f5f5; padding:20px; }
      .container { max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; text-align:center; }
      a { background:#4CAF50; color:#fff; padding:12px 24px; text-decoration:none; border-radius:5px; }
      .footer { margin-top:20px; font-size:12px; color:#777; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome to Codespace</h2>
      <p>Please verify your email to activate your account:</p>
      <a href="${url}">Confirm Email</a>
      <p class="footer">If you didn't request this, ignore this email.</p>
    </div>
  </body>
  </html>
`;
