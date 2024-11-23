// pw.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const sendEmail = require('./sendEmail'); // Ensure the path is correct
const router = express.Router();

// Route: /pw/forgotpassword
router.post('/forgotpassword', async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await db.collection('Users').findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ error: 'No user found with this email.' });
    }

    // Generate a unique reset token
    const resetToken = uuidv4();
    // Set token expiration time (e.g., 1 hour from now)
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour in milliseconds

    // Update user with reset token and expiration
    await db.collection('Users').updateOne(
      { UserId: user.UserId },
      { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires } }
    );

    // Send reset email with the token
    const emailSubject = 'Password Reset Request';
    const emailText = `Hello ${user.FirstName},\n\nYou requested a password reset. Please use the following token to reset your password:\n\nToken: ${resetToken}\n\nThis token will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nThank you,\nAfterWords Team`;

    await sendEmail(Email, emailSubject, emailText);

    res.status(200).json({ message: 'Password reset token sent successfully.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route: /pw/resetpassword
router.post('/resetpassword', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  try {
    // Find user with the reset token and ensure token hasn't expired
    const user = await db.collection('Users').findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: new Date() }, // Token expiration check
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and remove reset token fields
    await db.collection('Users').updateOne(
      { UserId: user.UserId },
      { $set: { Password: hashedPassword }, $unset: { passwordResetToken: "", passwordResetExpires: "" } }
    );

    // Optionally, send a confirmation email about password change
    const emailSubject = 'Password Reset Successful';
    const emailText = `Hello ${user.FirstName},\n\nYour password has been successfully reset.\n\nThank you,\nAfterWords Team`;

    await sendEmail(user.Email, emailSubject, emailText);

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
