const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Community = require('../models/Community');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/security');

const router = express.Router();

// Grant event permissions to user (Admin only)
router.post('/events/:eventId/grant', verifyToken, verifyRole('admin'), csrfProtection, async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const event = await Event.findById(req.params.eventId).populate('communityId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add event permissions to user
    if (!user.eventPermissions) {
      user.eventPermissions = [];
    }

    const existingPermission = user.eventPermissions.find(p => p.eventId.toString() === req.params.eventId);
    if (existingPermission) {
      existingPermission.permissions = permissions;
    } else {
      user.eventPermissions.push({
        eventId: req.params.eventId,
        permissions: permissions,
        grantedBy: req.user.userId,
        grantedAt: new Date()
      });
    }

    await user.save();
    res.json({ message: 'Permissions granted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update member role in community (Admin only)
router.put('/communities/:communityId/members/:userId/role', verifyToken, verifyRole('admin'), csrfProtection, async (req, res) => {
  try {
    const { role } = req.body;
    const community = await Community.findById(req.params.communityId);
    
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