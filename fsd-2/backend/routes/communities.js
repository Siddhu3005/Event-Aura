const express = require('express');
const Community = require('../models/Community');
const User = require('../models/User');
const Event = require('../models/Event');
const Query = require('../models/Query');
const Chat = require('../models/Chat');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/security');
const logger = require('../utils/logger');

const router = express.Router();

// Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true })
      .populate('adminId', 'name email')
      .populate('members.userId', 'name email')
      .populate('events');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create community (Admin only)
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { name, collegeName, description, category } = req.body;

    // Allow multiple communities per college with different names
    const existingCommunity = await Community.findOne({ name, collegeName });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community with this name already exists for your college' });
    }

    const community = new Community({
      name,
      collegeName,
      description,
      category,
      adminId: req.user.userId,
      members: [{ userId: req.user.userId, role: 'member' }]
    });

    await community.save();

    // Update user's joined communities
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { communitiesJoined: community._id }
    });

    logger.info(`Admin ${req.user.userId} created community ${community._id}`);
    res.status(201).json({ message: 'Community created successfully', community });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join community
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(member => {
      const memberId = member.userId ? member.userId.toString() : member.toString();
      return memberId === req.user.userId;
    });

    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push({ userId: req.user.userId, role: 'member' });
    await community.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { communitiesJoined: community._id }
    });

    logger.info(`User ${req.user.userId} joined community ${community._id}`);
    
    res.json({ 
      message: 'Joined community successfully',
      communityId: community._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get community details with channels
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('adminId', 'name email')
      .populate('members.userId', 'name email')
      .populate('events')
      .populate('announcements.createdBy', 'name');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Get recent queries
    const queries = await Query.find({ communityId: req.params.id })
      .populate('userId', 'name')
      .populate('eventId', 'name')
      .sort({ dateCreated: -1 })
      .limit(10);

    // Get recent chat messages
    const chatMessages = await Chat.find({ communityId: req.params.id })
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      community,
      queries,
      chatMessages: chatMessages.reverse() // Show oldest first
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add announcement (Admin only)
router.post('/:id/announcements', verifyToken, async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    community.announcements.push({
      title,
      content,
      createdBy: req.user.userId,
      pinned: pinned || false
    });

    await community.save();
    res.json({ message: 'Announcement added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send chat message
router.post('/:id/chat', verifyToken, async (req, res) => {
  try {
    const { message, messageType } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(member => {
      const memberId = member.userId ? member.userId.toString() : member.toString();
      return memberId === req.user.userId;
    });

    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to chat' });
    }

    const validMessageTypes = ['text', 'announcement', 'system', 'introductions', 'feedback', 'general'];
    const finalMessageType = validMessageTypes.includes(messageType) ? messageType : 'text';

    const chatMessage = new Chat({
      communityId: req.params.id,
      userId: req.user.userId,
      message: message.trim(),
      messageType: finalMessageType
    });

    await chatMessage.save();
    await chatMessage.populate('userId', 'name');

    logger.info(`Chat message sent in community ${req.params.id} by user ${req.user.userId}`);
    res.json({ message: 'Message sent', chatMessage });
  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admin communities
router.get('/admin/my-communities', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const communities = await Community.find({ adminId: req.user.userId })
      .populate('members.userId', 'name email')
      .populate('events');

    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        const totalQueries = await Query.countDocuments({ communityId: community._id });
        const pendingQueries = await Query.countDocuments({ 
          communityId: community._id, 
          status: 'open' 
        });
        const totalMessages = await Chat.countDocuments({ communityId: community._id });

        return {
          ...community.toObject(),
          stats: {
            totalMembers: community.members.length,
            totalEvents: community.events.length,
            totalQueries,
            pendingQueries,
            totalMessages
          }
        };
      })
    );

    res.json(communitiesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update member role (Admin only)
router.put('/:id/members/:userId/role', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const member = community.members.find(m => m.userId.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await community.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;