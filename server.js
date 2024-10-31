// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
      const { firstName, lastName, username, email, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ error: 'All fields must be entered.' });
      }

      try {
        // Check if the user already exists
        const existingUser = await db.collection('Users').findOne({ Username: username });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const result = await db.collection('Users').insertOne({
          Username: username,
          Password: hashedPassword,
          FirstName: firstName,
          LastName: lastName,
          Email: email,
        });

        // The new user's _id (ObjectId)
        const newUserId = result.insertedId;

        res.status(200).json({ message: 'User registered successfully.', userId: newUserId });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Route: /api/login
    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;

      try {
        const user = await db.collection('Users').findOne({ Username: username });

        if (user && await bcrypt.compare(password, user.Password)) {
          res.status(200).json({
            id: user._id, // Use the _id field (ObjectId)
            firstName: user.FirstName,
            lastName: user.LastName,
            error: '',
          });
        } else {
          res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'User not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.toString() });
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