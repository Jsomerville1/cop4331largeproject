const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { error } = require('console');



require('dotenv').config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb+srv://COP4331:COPT22POOSD@cluster0.stfv8.mongodb.net/?retryWrites=true&w=majority';
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB and start the server
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');

    const db = client.db('COP4331'); // Replace with your database name

    // Define API routes using relative paths

    // Route: /api/addcard
    app.post('/api/addcard', async (req, res) => {
      // Incoming: userId, card
      // Outgoing: error

      const { userId, card } = req.body;

      const newCard = { Card: card, UserId: userId };
      let error = '';

      try {
        const result = await db.collection('Cards').insertOne(newCard);
        res.status(200).json({ error: '' });
      } catch (e) {
        error = e.toString();
        res.status(500).json({ error: error });
      }
    });

    // Route: /api/login
    app.post('/api/login', async (req, res) => {
      // Incoming: login, password
      // Outgoing: id, firstName, lastName, error

      let error = '';

      const { login, password } = req.body;

      try {
        const results = await db.collection('Users').findOne({ login: login, password: password });

        if (results) {
          const id = results.UserID;
          const fn = results.FirstName;
          const ln = results.LastName;
          res.status(200).json({ id: id, firstName: fn, lastName: ln, error: '' });
        } else {
          res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'User not found' });
        }
      } catch (e) {
        error = e.toString();
        res.status(500).json({ error: error });
      }
    });

  
    api.post('/api/register', async (req, res) => {
      const { name, login, email, password } = req.body;
    
      // Validate required fields
      if (!name || !login || !email || !password) {
        return res.status(400).json({ error: 'All fields must be entered.' });
      }
    
      try {
        // Check if the user already exists
        const existingUser = await db.collection('Users').findOne({ login });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists.' });
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Insert the new user
        await db.collection('Users').insertOne({
          Name: name,
          login,
          Email: email,
          password: hashedPassword,
        });
    
        res.status(201).json({ message: 'User registered successfully.' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    



    // Route: /api/searchcards
    app.post('/api/searchcards', async (req, res) => {
      // Incoming: userId, search
      // Outgoing: results[], error

      let error = '';

      const { userId, search } = req.body;

      const _search = search.trim();

      try {
        const results = await db.collection('Cards').find({ "Card": { $regex: '^' + _search, $options: 'i' } }).toArray();

        const _ret = results.map(result => result.Card);

        res.status(200).json({ results: _ret, error: '' });
      } catch (e) {
        error = e.toString();
        res.status(500).json({ results: [], error: error });
      }
    });

    // Start the server after successful DB connection
    app.listen(5000, '0.0.0.0', () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit the application if unable to connect to MongoDB
  });