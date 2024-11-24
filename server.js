// server.js
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('./sendEmail'); // points to sendEmail function in sendEmail.js
const checkUserStatus = require('./checkUserStatus');
const sendPendingMessages = require('./sendPendingMessages');
const logger = require('./logger');
const triggerCronRoute = require('./triggerCron'); // Import the triggerCron route
const pwRoutes = require('./pw');


const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;




// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

// Object to store last run times
const cronStatus = {
  checkUserStatus: null,
  sendPendingMessages: null,
};




// Import ObjectId from MongoDB
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string with database name included
const url = 'mongodb+srv://COP4331:COPT22POOSD@cluster0.stfv8.mongodb.net/COP4331?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

// Connect to MongoDB and start the server
client.connect()
  .then(() => {

    console.log('Connected to MongoDB');

    db = client.db('COP4331'); // Ensure this matches database name exactly
    global.db = db;

    // --------------------------- TASK SCHEDULER ---------------------------

    // Schedule the tasks to run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      const startTime = new Date().toISOString();
      logger.info(`Scheduled tasks started at ${startTime}`);
      console.log(`Scheduled tasks started at ${startTime}`);

      try {
        await checkUserStatus(db);
        cronStatus.checkUserStatus = new Date();

        await sendPendingMessages(db);
        cronStatus.sendPendingMessages = new Date();

        const endTime = new Date().toISOString();
        logger.info(`Scheduled tasks completed at ${endTime}`);
        console.log(`Scheduled tasks completed at ${endTime}`);
      } catch (error) {
        logger.error('Error during scheduled tasks:', error);
        console.error('Error during scheduled tasks:', error);
      }
    });
    app.use('/triggerCron', triggerCronRoute);
    app.use('/pw', pwRoutes); // Use pw.js routes under /pw
    // Start the server after successful DB connection
    app.listen(5000, '0.0.0.0', () => {
      console.log('Server is running on port 5000');
    });

  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });


// Route: /api/register
app.post('/api/register', async (req, res) => {
  const { FirstName, LastName, Username, Email, Password, CheckInFreq } = req.body;

  // Validate required fields
  if (!FirstName || !LastName || !Username || !Email || !Password || !CheckInFreq) {
    return res.status(400).json({ error: 'All fields must be entered.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await db.collection('Users').findOne({ Username: Username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Generate a new UserId by incrementing the highest existing UserId
    let newUserId = 1; // Default to 1 if no users exist
    const lastUser = await db.collection('Users').find().sort({ UserId: -1 }).limit(1).toArray();
    if (lastUser.length > 0) {
      newUserId = lastUser[0].UserId + 1;
    }

    // Generate a verification code
    const verificationCode = uuidv4().slice(0, 8);

    const lastLogin = null;
    const status = "Active";
    const createdAt = new Date();

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(Password, 10); // 10 is the salt rounds

    // Create the new user document
    const newUser = {
      UserId: newUserId,
      FirstName,
      LastName,
      Username,
      Email,
      Password: hashedPassword, // Store the hashed password
      CheckInFreq,
      Verified: false,
      verificationCode, // Temporary code for email verification
      lastLogin: lastLogin,
      status: status,
      createdAt: createdAt
    };

    // Insert the new user into the database
    await db.collection('Users').insertOne(newUser);

    // Send verification email
    await sendEmail(Email, 'Verify Your Account', `Your verification code is: ${verificationCode}`);
    res.status(200).json({
      message: 'Registration successful. Please check your email for the verification code.',
      userId: newUserId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route: /api/login
app.post('/api/login', async (req, res) => {
  const { Username, Password } = req.body;

  try {
    const result = await db.collection('Users').findOne({ Username: Username });

    if (result) {
      // Check if the password matches using bcryptjs
      const passwordMatch = await bcrypt.compare(Password, result.Password);

      if (passwordMatch) {
        const {
          UserId: id,
          FirstName: fn,
          LastName: ln,
          Username: username,
          Email: email,
          CheckInFreq: checkInFreq,
          Verified: verified,
          deceased,
          createdAt,
          lastLogin,
        } = result;

        try {
          await db.collection('Users').updateOne(
            { UserId: id },
            { $set: { lastLogin: new Date() } }
          );
        } catch (updateError) {
          console.error("Error updating last login:", updateError);
        }

        // Check if user has verified email
        if (!verified) {
          res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Please verify your account' });
        } else {
          res.status(200).json({
            id,
            firstName: fn,
            lastName: ln,
            username,
            email,
            checkInFreq,
            verified,
            deceased,
            createdAt,
            lastLogin: new Date(),
            error: ''
          });
        }
      } else {
        // Password does not match
        res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Invalid username/password' });
      }
    } else {
      // User not found
      res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Invalid username/password' });
    }
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//displying recipients and messages
  app.post('/api/recipients', async (req, res) => {
    const { userId } = req.body;
  
    try {
      const recipients = await db.collection('Recipients').find({ userId: Number(userId) }).toArray();
      res.status(200).json({ recipients });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //to see the frequency of how many time to check in
// Update check-in frequency
app.post('/api/checkin-frequency', async (req, res) => {
  const userId = Number(req.body.userId);  // Ensure userId is a number
  const frequency = Number(req.body.CheckInFreq);  // Ensure frequency is a number

  try {
    // Update the user's CheckInFreq by UserId
    const result = await db.collection('Users').updateOne(
      { UserId: userId }, // Query by UserId
      { $set: { CheckInFreq: frequency } } // Set the correct field name
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Check-in frequency updated successfully.' });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error("Error updating CheckInFreq:", error.message);
    res.status(500).json({ error: error.message });
  }
});

  // DELETE USER ACCOUNT
app.post('/api/deleteUsers', async (req, res) => {
  const { userId } = req.body;

  try {
    // Ensure userId is treated as a number or string, depending on how it's stored in the database
    // Delete user's messages first if necessary
    await db.collection('Messages').deleteMany({ userId: userId });
    await db.collection('Recipients').deleteMany({ userId: userId });

    // Delete user account
    const result = await db.collection('Users').deleteOne({ UserId: userId }); // Query by UserId instead of _id

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'User account and associated data deleted successfully.' });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user: ' + error.message });
  }
});


// EMAIL VERIFICATION
app.post('/api/verify', async (req, res) => {
  const { Username, code } = req.body;

  try {
    const user = await db.collection('Users').findOne({ Username, verificationCode: code });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update verification status
    await db.collection('Users').updateOne(
      { Username },
      { $set: { Verified: true }, $unset: { verificationCode: "" } }
    );

    res.status(200).json({ message: 'Verification successful!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ADD MESSAGE
// Route: /api/addmessage
app.post('/api/addmessage', async (req, res) => {
  const { userId, content } = req.body;

  // Validate required fields
  if (!userId || !content) {
    return res.status(400).json({ error: 'userId and content are required.' });
  }

  const userIdNumber = Number(userId);
  if (isNaN(userIdNumber)) {
    return res.status(400).json({ error: 'userId must be a number.' });
  }

  try {
    // Generate a new messageId by incrementing the highest existing messageId
    let newMessageId = 1; // Default to 1 if no messages exist
    const lastMessage = await db.collection('Messages').find().sort({ messageId: -1 }).limit(1).toArray();
    if (lastMessage.length > 0) {
      newMessageId = lastMessage[0].messageId + 1;
    }

    // Create the new message document
    const newMessage = {
      messageId: newMessageId,
      userId: userIdNumber,
      content: content,
      isSent: false,
      createdAt: new Date(),
      sendAt: null
    };

    // Insert the new message into the db
    await db.collection('Messages').insertOne(newMessage);

    res.status(200).json({ message: 'Message added successfully.', messageId: newMessageId });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// EDIT MESSAGE
// Route: /api/editmessage
app.post('/api/editmessage', async (req, res) => {
  const { messageId, userId, content } = req.body;

  // Validate required fields
  if (!messageId || !userId || !content) {
    return res.status(400).json({ error: 'messageId, userId, and content are required.' });
  }

  const messageIdNumber = Number(messageId);
  const userIdNumber = Number(userId);

  if (isNaN(messageIdNumber) || isNaN(userIdNumber)) {
    return res.status(400).json({ error: 'messageId and userId must be numbers.' });
  }

  try {
    // Update the message content
    const result = await db.collection('Messages').updateOne(
      { messageId: messageIdNumber, userId: userIdNumber },
      { $set: { content: content } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Message not found or user does not have permission to edit this message.' });
    }

    res.status(200).json({ message: 'Message updated successfully.' });
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE MESSAGE
// Route: /api/deletemessage
app.post('/api/deletemessage', async (req, res) => {
  const { messageId, userId } = req.body;

  // Validate required fields
  if (!messageId || !userId) {
    return res.status(400).json({ error: 'messageId and userId are required.' });
  }

  const messageIdNumber = Number(messageId);
  const userIdNumber = Number(userId);

  if (isNaN(messageIdNumber) || isNaN(userIdNumber)) {
    return res.status(400).json({ error: 'messageId and userId must be numbers.' });
  }

  try {
    // Delete the message
    const result = await db.collection('Messages').deleteOne({ messageId: messageIdNumber, userId: userIdNumber });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found or user does not have permission to delete this message.' });
    }

    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADD RECIPIENT
// Route: /api/addRecipient
app.post('/api/addRecipient', async (req, res) => {
  const { userId, username, recipientName, recipientEmail, messageId } = req.body;

  // Validate required fields
  if ((!userId && !username) || !recipientName || !recipientEmail || !messageId) {
    return res.status(400).json({ error: 'At least one of userId or username, along with recipientName, recipientEmail, and messageId, is required.' });
  }

  try {
    let user;

    if (userId) {
      // Validate that userId is a number
      if (typeof userId !== 'number') {
        return res.status(400).json({ error: 'userId must be a number.' });
      }

      // Retrieve the user based on userId
      user = await db.collection('Users').findOne({ UserId: userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found with the provided userId.' });
      }
    } else if (username) {
      // Retrieve the user based on username
      user = await db.collection('Users').findOne({ Username: username });
      if (!user) {
        return res.status(404).json({ error: 'User not found with the provided username.' });
      }
    }

    // If both userId and username are provided, ensure they match
    if (userId && username) {
      if (user.UserId !== userId) {
        return res.status(400).json({ error: 'userId and username do not match.' });
      }
    }

    const resolvedUserId = user.UserId;

    // Generate a new recipientId by incrementing the highest existing recipientId
    let newRecipientId = 1; // Default to 1 if no recipients exist
    const lastId = await db.collection('Recipients').find().sort({ recipientId: -1 }).limit(1).toArray();
    if (lastId.length > 0) {
      newRecipientId = lastId[0].recipientId + 1;
    }

    // Add the new recipient with userId to the Recipients collection
    const newRecipient = {
      recipientId: newRecipientId,  // Generate unique ID for recipient
      userId: resolvedUserId,       // Associate recipient with this user
      recipientName,
      recipientEmail,
      messageId,
      createdAt: new Date()          // Optional: track when the recipient was added
    };

    await db.collection('Recipients').insertOne(newRecipient);

    res.status(201).json({ message: 'Recipient added successfully', recipientId: newRecipient.recipientId });
  } catch (error) {
    console.error('Error adding recipient:', error);
    res.status(500).json({ error: 'Failed to add recipient' });
  }
});

// EDIT RECIPIENT
app.post('/api/editRecipient', async (req, res) => {
  const { recipientId, messageId, recipientName, recipientEmail } = req.body;

  if (!recipientId || !recipientName || !recipientEmail) {
    return res.status(400).json({ error: 'recipientId, recipientName, and recipientEmail are required.' });
  }

  try {
    const filter = { recipientId: Number(recipientId) };
    if (messageId) {
      filter.messageId = Number(messageId);
    }

    const updateFields = { recipientName, recipientEmail };
    if (messageId) {
      updateFields.messageId = Number(messageId);
    }

    const result = await db.collection('Recipients').updateOne(
      filter,
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    res.status(200).json({ message: 'Recipient updated successfully' });
  } catch (err) {
    console.error('Error updating recipient:', err);
    res.status(500).json({ error: 'Failed to update recipient' });
  }
});

// DELETE RECIPIENT
app.post('/api/deleteRecipient', async (req, res) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ error: 'recipientId required.' });
  }

  try {
    const result = await db.collection('Recipients').deleteOne({
      recipientId: Number(recipientId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    res.status(200).json({ message: 'Recipient deleted successfully' });
  } catch (err) {
    console.error('Error deleting recipient:', err);
    res.status(500).json({ error: 'Failed to delete recipient' });
  }
});

//CHECK IN USER
app.post('/api/checkIn', async (req,res) => {
  const{UserId} = req.body;

  try{

    const result = await db.collection('Users').updateOne(
      {UserId: UserId},
      {
        $set: {
          lastLogin: new Date(),
          status: 'Active'
        },
        $inc: {frequency: 1}
      },
      {upsert: true}
    );

    res.status(200).json({message:'You checked in!', result});
  }catch(error){
    res.status(404).json({error: 'Could not check you in'});
  }
});

// GET A USERS MESSAGES
// Route: /api/getUserMessages
app.post('/api/getUserMessages', async (req, res) => {
  const { userId } = req.body;

  try {
    // Ensure userId is a number
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ error: 'Invalid userId.' });
    }

    // Use MongoDB's aggregation framework to join Messages and Recipients
    const messages = await db.collection('Messages').aggregate([
      {
        $match: { userId: userIdNumber }
      },
      {
        $lookup: {
          from: 'Recipients',
          localField: 'messageId',
          foreignField: 'messageId',
          as: 'recipients'
        }
      }
    ]).toArray();

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error retrieving user messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// UPLOAD PDF
app.post('/api/uploadPdf', upload.single('pdfFile'), async (req, res) => {
  const { userId, recipientEmail, recipientName, title } = req.body;

  if (!req.file || !userId || !recipientEmail || !recipientName || !title) {
    return res.status(400).json({ error: 'userId, recipientEmail, recipientName, title, and pdfFile are required.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ error: 'Invalid recipient email format.' });
  }

  const userIdNumber = Number(userId);
  if (isNaN(userIdNumber)) {
    return res.status(400).json({ error: 'userId must be a number.' });
  }
   
    try {
      // Generate a new messageId by incrementing the highest existing messageId
      let newDocumentId = 1; // Default to 1 if no messages exist
      const lastDocument = await db.collection('Documents').find().sort({ documentId: -1 }).limit(1).toArray();
      if (lastDocument.length > 0) {
        newDocumentId = lastDocument[0].documentId + 1;
      }

    const newDocument = {
      documentId: newDocumentId,
      userId: Number(userId),
      recipientEmail,
      recipientName,
      title,
      filePath: req.file.path,
      isSent: false,
      createdAt: new Date(),
    };

    await db.collection('Documents').insertOne(newDocument);

    res.status(201).json({ message: 'PDF uploaded successfully', documentId: newDocumentId });
  } catch (error) {
    console.error('Error uploading PDF:', error);

    // Handle duplicate key error
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(500).json({ error: 'Duplicate documentId. Please try again.' });
    }

    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// RETREIVE USERS PDF UPLOADS
app.post('/api/getUserDocuments', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  try {
    const documents = await db.collection('Documents').find({ userId: Number(userId) }).toArray();
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// DELETE A PDF
app.post('/api/deleteDocument', async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({ error: 'documentId is required.' });
  }

  try {
    const document = await db.collection('Documents').findOne({ documentId: Number(documentId) });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Delete the file from the filesystem
    const fs = require('fs');
    fs.unlink(document.filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        // Proceed to delete from DB even if file deletion fails
      }
    });

    // Delete the document from MongoDB
    await db.collection('Documents').deleteOne({ documentId: Number(documentId) });

    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});



// EDIT USER
app.post('/api/editUser', async (req,res) => {

  const {userId, currentPassword, newEmail, newPassword} = req.body;

  try{
    const user = await db.collection('Users').findOne({UserId: userId });

    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const updates = {};
    if (newEmail) updates.Email = newEmail;
    if (newPassword) updates.Password = await bcrypt.hash(newPassword, 10);

    // Update the user
    const result = await db.collection('Users').updateOne(
      { UserId: userId },
      { $set: updates }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'User details updated successfully' });
    } else {
      res.status(400).json({ error: 'No changes were made' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  });

// Function to Escape Regex Special Characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}

// SEARCH RECIPIENTS
app.post('/api/search', async (req, res) => { 
  const { userId, query } = req.body; 
  
  console.log('Search Request Received:', { userId, query }); // Logging

  // Input Validation
  if (userId === undefined || userId === null || typeof userId !== 'number') {
    return res.status(400).json({ error: 'A valid userId (number) is required.' });
  }

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: 'A valid search query (non-empty string) is required.' });
  }

  try {
    const filter = {
      userId: userId,
      $or: [
        { recipientName: { $regex: `.*${escapeRegex(query)}.*`, $options: 'i' } }, // search by recipient name
        { Email: { $regex: `.*${escapeRegex(query)}.*`, $options: 'i' } } // search by email
      ]
    };

    console.log('MongoDB Query Filter:', filter); // Logging

    const recipients = await db.collection('Recipients').find(filter).toArray();

    console.log('Search Results:', recipients); // Logging

    res.status(200).json({ recipients });
  } catch (error) {
    console.error('Error searching recipients:', error);
    res.status(500).json({ error: 'Failed to search recipients.' });
  }
});