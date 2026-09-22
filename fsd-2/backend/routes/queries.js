const express = require('express');
const Query = require('../models/Query');
const Community = require('../models/Community');
const { verifyToken } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/security');
const logger = require('../utils/logger');

const router = express.Router();

// Create query
router.post('/', verifyToken, async (req, res) => {
  try {
    const { communityId, eventId, issueType, description } = req.body;

    const query = new Query({
      userId: req.user.userId,
      communityId,
      eventId,
      issueType,
      description
    });

    await query.save();
    res.status(201).json({ message: 'Query submitted successfully', query });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get queries for community
router.get('/community/:id', verifyToken, async (req, res) => {
  try {
    const queries = await Query.find({ communityId: req.params.id })
      .populate('userId', 'name')
      .populate('eventId', 'name')
      .sort({ dateCreated: -1 });
    
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to query (Admin only)
router.put('/:id/respond', verifyToken, async (req, res) => {
  try {
    const { reply } = req.body;
    const query = await Query.findById(req.params.id).populate('communityId');
    
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (query.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    query.reply = reply;
    query.status = 'resolved';
    query.dateResolved = new Date();
    await query.save();

    res.json({ message: 'Query resolved successfully', query });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;