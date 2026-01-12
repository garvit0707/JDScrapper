const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // Use app password if 2FA is enabled
  },
});

exports.sendJobEmail = async (htmlContent) => {
  const mailOptions = {
    from: `"Job Scraper" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: "Today's React Native Job Openings",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
