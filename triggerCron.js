// routes/triggerCron.js
const express = require('express');
const router = express.Router();
const checkUserStatus = require('./checkUserStatus');
const sendPendingMessages = require('./sendPendingMessages');
const logger = require('./logger');

// Route to trigger checkUserStatus
router.post('/checkUserStatus', async (req, res) => {
  try {
    await checkUserStatus(global.db); // Accessing 'db' via global scope
    logger.info('Manually triggered checkUserStatus');
    res.status(200).json({ message: 'checkUserStatus executed successfully.' });
  } catch (error) {
    logger.error('Error executing checkUserStatus:', error);
    res.status(500).json({ error: 'Failed to execute checkUserStatus.' });
  }
});

// Route to trigger sendPendingMessages
router.post('/sendPendingMessages', async (req, res) => {
  try {
    await sendPendingMessages(global.db); // Accessing 'db' via global scope
    logger.info('Manually triggered sendPendingMessages');
    res.status(200).json({ message: 'sendPendingMessages executed successfully.' });
  } catch (error) {
    logger.error('Error executing sendPendingMessages:', error);
    res.status(500).json({ error: 'Failed to execute sendPendingMessages.' });
  }
});

module.exports = router;
