// server.js
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const sendEmail = require('./sendEmail'); // points to sendEmail function in sendEmail.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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


    db = client.db('COP4331'); // Ensure this matches your database name exactly


// Route: /api/register
app.post('/api/register', async (req, res) => {
  const { FirstName, LastName, Username, Email, Password, CheckInFreq} = req.body;

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


    // Create the new user document
    const newUser = {
      UserId: newUserId,
      FirstName,
      LastName,
      Username,
      Email,
      Password, // ****** NEED TO HASH PASSWORD
      CheckInFreq,
      Verified: false,
      verificationCode, // temp code for email verification
      lastLogin: lastLogin,
      status: status,
      createdAt: createdAt
    };

    // insert the new user into the db
    await db.collection('Users').insertOne(newUser);

    // send verification email
    await sendEmail(Email, 'Verify Your Account', `Your verification code is: ${verificationCode}`);
    res.status(200).json({
      message: 'Registration successful. Please check your email for the verification code.',
      userId: newUserId,
    });

    //res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

    // Route: /api/login
    app.post('/api/login', async (req, res) => {
      // Incoming: Username, Password
      // Outgoing: UserId, FirstName, LastName, error

      let error = '';

      const { Username, Password } = req.body;

      try {
        const result = await db.collection('Users').findOne({ Username: Username, Password: Password });

        if (result) {
          const { 
            UserId: id, 
            FirstName: fn, 
            LastName: ln, 
            Username: username, 
            Email: email, 
            CheckInFreq: checkInFreq, 
            Verified: verified, 
            deceased, 
            createdAt 
          } = result;
         
          try {
            await db.collection('Users').updateOne(
              { UserId: id },
              { $set: { lastLogin: new Date() } }
            );
          } catch (updateError) {
            console.error("Error updating last login:", updateError);
          }

          // check if user has verified email
          if (!verified) {
            res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Please verify your account'});
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
              error: '' 
            });
          }
        } else {
          res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'User not found' });
        }
      } catch (e) {
        error = e.toString();
        res.status(500).json({ error: error });
      }
    });



    // Route: /api/addcard
    app.post('/api/addcard', async (req, res) => {
      const { userId, card } = req.body;

      // Convert userId to ObjectId
      const userObjectId = new ObjectId(userId);

      const newCard = { Card: card, UserId: userObjectId };
      let error = '';

      try {
        await db.collection('Cards').insertOne(newCard);
        res.status(200).json({ error: '' });
      } catch (e) {
        error = e.toString();
        res.status(500).json({ error: error });
      }
    });

    // Route: /api/searchcards
    app.post('/api/searchcards', async (req, res) => {
      const { userId, search } = req.body;

      // Convert userId to ObjectId
      const userObjectId = new ObjectId(userId);

      const _search = search.trim();

      try {
        const results = await db.collection('Cards').find({
          UserId: userObjectId,
          Card: { $regex: '^' + _search, $options: 'i' },
        }).toArray();

        const _ret = results.map(result => result.Card);

        res.status(200).json({ results: _ret, error: '' });
      } catch (e) {
        res.status(500).json({ results: [], error: e.toString() });
      }
    });

    // Start the server after successful DB connection
    app.listen(5000, '0.0.0.0', () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
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

/*
//Route: /api/addRecipients
app.post('/api/addRecipients', (req, res) => {
  const { firstName, lastName, email } = req.body;

  const sql = 'INSERT INTO recipients (FirstName, LastName, Email) VALUES (?, ?, ?)';
  db.query(sql, [firstName, lastName, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add recipient' });
    }
    res.status(201).json({ message: 'Recipient added successfully', recipientId: result.insertId });
  });
});

//Route: /api/editRecipients
app.put('/api/editRecipients', (req, res) => {
  const { id, firstName, lastName, email } = req.body;

  const sql = 'UPDATE recipients SET FirstName = ?, LastName = ?, Email = ? WHERE RecipientID = ?';
  db.query(sql, [firstName, lastName, email, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update recipient' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    res.status(200).json({ message: 'Recipient updated successfully' });
  });
});

//Route: /api/deleteRecipients
app.delete('/api/deleteRecipients', (req, res) => {
  const { id } = req.body;

  const sql = 'DELETE FROM recipients WHERE RecipientID = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete recipient' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    res.status(200).json({ message: 'Recipient deleted successfully' });
  });
});

*/

// ADD RECIPIENT
// Route: /api/addRecipient
app.post('/api/addRecipient', async (req, res) => {
  const { username, recipientName, recipientEmail, messageId } = req.body;

  // Validate required fields
  if (!username || !recipientName || !recipientEmail || !messageId) {
    return res.status(400).json({ error: 'All fields (username, recipientName, recipientEmail, messageId) are required.' });
  }

  try {
    // Retrieve the userId from the Users collection based on username
    const user = await db.collection('Users').findOne({ Username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = user.UserId;

    // Add the new recipient with userId to the Recipients collection
    const newRecipient = {
      recipientId: uuidv4(),  // Generate unique ID for recipient
      userId,                 // Associate recipient with this user
      recipientName,
      recipientEmail,
      messageId,
      createdAt: new Date()    // Optional: track when the recipient was added
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

  if (!recipientId || !messageId || !recipientName || !recipientEmail) {
    return res.status(400).json({ error: 'All fields (recipientId, messageId, recipientName, recipientEmail) are required.' });
  }

  try {
    const result = await db.collection('Recipients').updateOne(
      { recipientId: Number(recipientId), messageId: Number(messageId) },
      { $set: { recipientName: recipientName, recipientEmail: recipientEmail } }
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
  const{userId} = req.body;

  try{

    const result = await db.collection('Users').updateOne(
      {userId: userId},
      {
        $set: {
          lastCheckIn: new Date(),
          status: 'Checked In'
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
