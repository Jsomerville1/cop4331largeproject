const nodemailer = require('nodemailer');
require('dotenv').config();
const logger = require('./logger');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another service, e.g., 'hotmail', 'yahoo', or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Function to send a plain text email
async function sendTextEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to,                           // Recipient address
    subject,                      // Subject line
    text,                         // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Text email sent to ${to}`);
  } catch (error) {
    console.error(`[ERROR] Failed to send text email to ${to}:`, error);
    throw error;
  }
}

// Function to send an email with a PDF attachment
async function sendDocumentEmail(to, subject, text, attachmentPath) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to,                           // Recipient address
    subject,                      // Subject line
    text,                         // Plain text body
    attachments: [
      {
        filename: require('path').basename(attachmentPath),
        path: attachmentPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Document email sent to ${to} with attachment ${attachmentPath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to send document email to ${to}:`, error);
    throw error;
  }
}

// Main function to send pending messages and documents
async function sendPendingMessages(db) {
  const now = new Date();
  console.log(`[DEBUG] Current Time: ${now.toISOString()}`); // Debug log

  try {
    // Find all inactive users
    const inactiveUsers = await db.collection('Users').find({ status: "Inactive" }).toArray();
    console.log(`[DEBUG] Retrieved ${inactiveUsers.length} inactive users from the database.`); // Debug log

    for (const user of inactiveUsers) {
      const { UserId, FirstName, Email } = user;

      // ----------------------------
      // Handle Text Messages
      // ----------------------------
      // Find all unsent messages for this user
      const messages = await db.collection('Messages').find({ userId: UserId, isSent: false, isPdf: false }).toArray();
      console.log(`[DEBUG] Found ${messages.length} unsent text messages for UserID: ${UserId}`); // Debug log

      for (const message of messages) {
        const { messageId, content } = message;

        try {
          // Send the text message email
          await sendTextEmail(Email, `Message Notification for ${FirstName}`, content);

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
          console.error(`[ERROR] Failed to send text email to ${Email} for MessageID: ${messageId}:`, emailError);
        }
      }

      // ----------------------------
      // Handle PDF Documents
      // ----------------------------
      // Find all unsent documents for this user
      const documents = await db.collection('Documents').find({ userId: UserId, isSent: false }).toArray();
      logger.info('Called documents email send part bla bla'); // Debug log

      console.log(`[DEBUG] Found ${documents.length} unsent documents for UserID: ${UserId}`); // Debug log

      for (const document of documents) {
        const { documentId, recipientName, filePath } = document;

        try {
          // Define email subject and text for documents
          const subject = `Document Notification for ${recipientName}`;
          const text = `Hello ${recipientName},\n\n ${FirstName} thought it was important that you have this document.`;

          // Send the document email with attachment
          await sendDocumentEmail(Email, subject, text, filePath);

          // Update document status to "sent" and set sendAt
          const updateResult = await db.collection('Documents').updateOne(
            { documentId: documentId },
            { $set: { isSent: true } }
          );

          if (updateResult.modifiedCount === 1) {
            console.log(`[SUCCESS] DocumentID: ${documentId} marked as sent.`);
          } else {
            console.warn(`[WARN] Failed to mark DocumentID: ${documentId} as sent.`);
          }
        } catch (emailError) {
          console.error(`[ERROR] Failed to send document email to ${Email} for DocumentID: ${documentId}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error(`[ERROR] Error in sendPendingMessages: ${error.message}`);
    console.error(error); // Full stack trace for debugging
  }
}

module.exports = sendPendingMessages;
