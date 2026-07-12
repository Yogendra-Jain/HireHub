const axios = require("axios");

const sendEmail = async (to, subject, html) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not defined in environment variables");
    }

    // Resend's API endpoint (runs over HTTPS port 443 - never blocked by Render)
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "HireHub <onboarding@resend.dev>", // Note: Free accounts can only send from onboarding@resend.dev
        to: [to],
        subject: subject,
        html: html,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully via Resend:", response.data.id);
    return response.data;

  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message;
    console.log("EMAIL ERROR:", errorDetails);
    throw new Error(errorDetails);
  }
};

module.exports = sendEmail;