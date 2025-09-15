export const forgotPasswordTemplate = (url: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Poppins', Arial, sans-serif; background:#f5f5f5; padding:20px; }
      .container { max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; text-align:center; }
      a.button {
        display:inline-block;
        background:#e63946;
        color:#fff !important;
        padding:12px 24px;
        text-decoration:none;
        border-radius:5px;
        font-weight:600;
      }
      a.button:visited,
      a.button:hover,
      a.button:active {
        color:#fff !important;
        background:#d62828;
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
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <a href="${url}" class="button">Reset Password</a>
      <p class="footer">If you didn’t request this, you can safely ignore this email.</p>
    </div>
  </body>
  </html>
`;
