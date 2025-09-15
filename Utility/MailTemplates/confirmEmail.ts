export const confirmationTemplate = (url: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Poppins', Arial, sans-serif; background:#f5f5f5; padding:20px; }
      .container { max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; text-align:center; }
      a {
        background:#4CAF50;
        color:#fff;
        padding:12px 24px;
        text-decoration:none;
        border-radius:5px;
        font-weight:600;
        display:inline-block;
      }
      a:visited,
      a:hover,
      a:active {
        color:#fff;
        background:#43a047;
      }
      img{
        height:2rem;
      }
      .footer { margin-top:20px; font-size:12px; color:#777; }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="https://codespacestorage.blob.core.windows.net/assets/logos/logo2.png"/>
      <h2>Welcome to Codespace</h2>
      <p>Please verify your email to activate your account:</p>
      <a href="${url}">Confirm Email</a>
      <p class="footer">If you didn't request this, ignore this email.</p>
    </div>
  </body>
  </html>
`;
