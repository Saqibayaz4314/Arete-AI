const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const defaultUser = "ayazs4314@gmail.com";
  const defaultPass = "aegilkgyqbfjmtzx";

  const smtpUser = process.env.SMTP_EMAIL || defaultUser;
  const smtpPass = process.env.SMTP_PASSWORD || defaultPass;

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME || "Arete.ai"} <${process.env.FROM_EMAIL || smtpUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
