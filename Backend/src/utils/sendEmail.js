const nodemailer = require("nodemailer");

function getResetPasswordHtml(resetUrl, username = "Candidate") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — Arete-AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #e2e8f0;
      margin: 0;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 560px;
      margin: 0 auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #334155;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .content {
      padding: 36px 32px;
    }
    h2 {
      color: #f8fafc;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);
    }
    .link-box {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 12px 16px;
      border-radius: 8px;
      word-break: break-all;
      font-size: 13px;
      color: #818cf8;
      margin-top: 16px;
    }
    .warning {
      background: rgba(245, 158, 11, 0.1);
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 13px;
      color: #fbbf24;
      margin-top: 24px;
    }
    .footer {
      background: #0f172a;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-text">Arete-AI</div>
      <div class="subtitle">Autonomous AI Interview Coach</div>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset the password for your Arete-AI account. Click the button below to set a new password:</p>
      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
      </div>
      <p>If the button above does not work, copy and paste the following link into your web browser:</p>
      <div class="link-box">${resetUrl}</div>
      <div class="warning">
        <strong>Security Notice:</strong> This link will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Arete-AI. Autonomous AI Interview Calibration Engine.<br>
      All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

const sendEmail = async (options) => {
  const smtpUser = process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials (SMTP_EMAIL / SMTP_PASSWORD) are missing in environment variables.");
  }

  // Primary: Use SMTPS port 465 (SSL) to avoid DigitalOcean port 587 STARTTLS blocking
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465 SMTPS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const message = {
    from: `"${process.env.FROM_NAME || "Arete AI"}" <${process.env.FROM_EMAIL || smtpUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || (options.resetUrl ? getResetPasswordHtml(options.resetUrl, options.username || "Candidate") : undefined),
  };

  const info = await transporter.sendMail(message);
  console.log("✅ [SMTP] Email sent successfully to %s (ID: %s)", options.email, info.messageId);
  return info;
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.getResetPasswordHtml = getResetPasswordHtml;
