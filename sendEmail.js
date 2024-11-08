// sendEmail.js
const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another service, e.g., 'hotmail', 'yahoo', or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// The function to send an email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address (your email)
    to,                           // Recipient address
    subject,                      // Subject line
    text,                         // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error for handling elsewhere if needed
  }
}

module.exports = sendEmail;
