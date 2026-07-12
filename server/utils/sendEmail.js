const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Hybrid email sender:
 *  - If RESEND_API_KEY is set  → sends via Resend HTTP API  (works on Render)
 *  - Otherwise                 → sends via Nodemailer/Gmail  (works on localhost)
 */
const sendEmail = async (to, subject, html) => {

  // ──────────────────────────────────────────────
  // PATH 1 — Resend HTTP API (for deployment)
  // ──────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await axios.post(
        "https://api.resend.com/emails",
        {
          from: `HireHub <${process.env.RESEND_FROM || "onboarding@resend.dev"}>`,
          to: [to],
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Email sent via Resend:", response.data.id);
      return response.data;

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.log("EMAIL ERROR (Resend):", msg);
      throw new Error(msg);
    }
  }

  // ──────────────────────────────────────────────
  // PATH 2 — Nodemailer / Gmail SMTP (for localhost)
  // ──────────────────────────────────────────────
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials missing: set RESEND_API_KEY (deployment) or EMAIL_USER + EMAIL_PASS (localhost)"
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.trim(), // .trim() removes accidental leading/trailing spaces
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