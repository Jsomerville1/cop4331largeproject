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
          const id = result.UserId;
          const fn = result.FirstName;
          const ln = result.LastName;
          const verified = result.Verified;
          $set: lastLogin: new Date();
          // check if user has verified email
          if (!verified) {
            res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'Please verify your account'});
          } else {
            // user is verified, allow login
            res.status(200).json({ id: id, firstName: fn, lastName: ln, verified: verified, error: '' });
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
      const recipients = await db.collection('Recipients').find({ userId }).toArray();
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

  //deletes the user
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

// endpoint for user email verificaiton
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



//in progress

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




  