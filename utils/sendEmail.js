// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (The Mail Truck)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options (The Envelope & Letter)
  const mailOptions = {
    from: 'Homely Reservations <sudeshnabiswas2005@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.html, // Using HTML allows us to send beautiful emails!
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
