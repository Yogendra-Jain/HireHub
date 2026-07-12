const nodemailer = require("nodemailer");
const dns = require("dns");

const sendEmail = async (to, subject, html) => {
  try {

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Force IPv4 lookup during DNS resolution
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { ...options, family: 4 }, callback);
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