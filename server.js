// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import ObjectId from MongoDB
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string with database name included
const url = 'mongodb+srv://COP4331:COPT22POOSD@cluster0.stfv8.mongodb.net/COP4331?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB and start the server
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');


    const db = client.db('COP4331'); // Ensure this matches your database name exactly



// Route: /api/register
app.post('/api/register', async (req, res) => {
  const { FirstName, LastName, Username, Email, Password } = req.body;

  // Validate required fields
  if (!FirstName || !LastName || !Username || !Email || !Password) {
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

    // Insert the new user
    await db.collection('Users').insertOne({
      UserId: newUserId,
      Username: Username,
      Password: Password,
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
    });

    res.status(200).json({ message: 'User registered successfully.', userId: newUserId });
  } catch (e) {
    res.status(500).json({ error: e.message });
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
          res.status(200).json({ id: id, firstName: fn, lastName: ln, error: '' });
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