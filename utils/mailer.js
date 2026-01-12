const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
         user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, 
    }
});


exports.sendJobEmail = async(htmlContent) =>{
   const mailOptions = {
    from: `"Job Scraper" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: "🔥 Today's React Job Openings",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions)
}
