const nodemailer = require("nodemailer");
const dns = require("dns").promises;

const sendEmail = async (to, subject, html) => {
  try {

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing");
    }

    // Dynamically resolve smtp.gmail.com to an IPv4 address to prevent IPv6 ENETUNREACH errors on Render
    const addresses = await dns.resolve4("smtp.gmail.com");
    if (!addresses || addresses.length === 0) {
      throw new Error("Failed to resolve smtp.gmail.com to an IPv4 address");
    }
    const ipv4Host = addresses[0];

    const transporter = nodemailer.createTransport({
      host: ipv4Host,
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Required so SSL validation matches the certificate domain instead of the raw IP
        servername: "smtp.gmail.com",
      },
    });


    const info = await transporter.sendMail({

      from: `"HireHub" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      html,

    });


    console.log(
      "Email sent:",
      info.messageId
    );


    return info;


  } catch (error) {

    console.log(
      "EMAIL ERROR:",
      error.message
    );

    throw error;
  }
};


module.exports = sendEmail;