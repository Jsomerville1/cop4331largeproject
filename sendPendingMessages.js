// sendPendingMessages.js
const nodemailer = require('nodemailer');

async function sendPendingMessages(db) {
  const now = new Date();
  console.log(`[DEBUG] Current Time: ${now.toISOString()}`); // Debug log

  try {
    // Find all inactive users
    const inactiveUsers = await db.collection('Users').find({ status: "Inactive" }).toArray();
    console.log(`[DEBUG] Retrieved ${inactiveUsers.length} inactive users from the database.`); // Debug log

    for (const user of inactiveUsers) {
      const { UserId, FirstName, Email } = user;

      // Find all unsent messages for this user
      const messages = await db.collection('Messages').find({ userId: UserId, isSent: false }).toArray();
      console.log(`[DEBUG] Found ${messages.length} unsent messages for UserID: ${UserId}`); // Debug log

      for (const message of messages) {
        const { messageId, content, sendAt } = message;

        // Prepare email transporter (ensure you have correct SMTP settings)
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or your email service
          auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: Email, // Assuming you want to send to the user's email
          subject: `Message Notification for ${FirstName}`,
          text: content,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`[SUCCESS] Email sent to ${Email} for MessageID: ${messageId}`);

          // Update message status to "sent" and set sendAt
          const updateResult = await db.collection('Messages').updateOne(
            { messageId: messageId },
            { $set: { isSent: true, sendAt: now } }
          );

          if (updateResult.modifiedCount === 1) {
            console.log(`[SUCCESS] MessageID: ${messageId} marked as sent.`);
          } else {
            console.warn(`[WARN] Failed to mark MessageID: ${messageId} as sent.`);
          }
        } catch (emailError) {
          console.error(`[ERROR] Failed to send email to ${Email} for MessageID: ${messageId}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error(`[ERROR] Error in sendPendingMessages: ${error.message}`);
    console.error(error); // Full stack trace for debugging
  }
}

module.exports = sendPendingMessages;
