const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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