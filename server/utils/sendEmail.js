const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Hybrid email sender:
 *  - If BREVO_API_KEY is set  → sends via Brevo HTTP API  (works on Render — no domain needed)
 *  - Otherwise                → sends via Nodemailer/Gmail  (works on localhost)
 */
const sendEmail = async (to, subject, html) => {

  // ──────────────────────────────────────────────
  // PATH 1 — Brevo HTTP API (for deployment)
  // Free: 300 emails/day, no custom domain needed
  // ──────────────────────────────────────────────
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "HireHub",
            email: process.env.EMAIL_USER || "jainyogendra855@gmail.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Email sent via Brevo:", response.data.messageId);
      return response.data;

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.log("EMAIL ERROR (Brevo):", msg);
      throw new Error(msg);
    }
  }

  // ──────────────────────────────────────────────
  // PATH 2 — Nodemailer / Gmail SMTP (for localhost)
  // ──────────────────────────────────────────────
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials missing: set BREVO_API_KEY (deployment) or EMAIL_USER + EMAIL_PASS (localhost)"
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    const info = await transporter.sendMail({
      from: `"HireHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent via Gmail:", info.messageId);
    return info;

  } catch (error) {
    console.log("EMAIL ERROR (Gmail):", error.message);
    throw error;
  }
};

module.exports = sendEmail;