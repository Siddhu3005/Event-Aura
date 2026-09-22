const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'communitiesJoined',
        select: 'name collegeName category members events',
        populate: {
          path: 'events',
          select: 'name theme'
        }
      })
      .populate('certificates.eventId', 'name');
    
    const events = await Event.find({ participants: req.user.userId })
      .populate('communityId', 'name collegeName')
      .sort({ startDate: 1 });

    const now = new Date();
    const categorizedEvents = {
      ongoing: events.filter(e => now >= new Date(e.startDate) && now <= new Date(e.endDate)),
      upcoming: events.filter(e => now < new Date(e.startDate)),
      completed: events.filter(e => now > new Date(e.endDate))
    };

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        badges: user.badges,
        certificates: user.certificates,
        communitiesJoined: user.communitiesJoined
      },
      events: categorizedEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity timeline
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('communitiesJoined', 'name')
      .populate('certificates.eventId', 'name');
    
    const events = await Event.find({ participants: req.user.userId })
      .populate('communityId', 'name')
      .sort({ dateCreated: -1 });
    
    const activities = [
      ...user.communitiesJoined.map(community => ({
        type: 'community_joined',
        title: `Joined ${community.name} community`,
        date: user.dateCreated, // Approximate date
        community: community.name
      })),
      ...events.map(event => ({
        type: 'event_registered',
        title: `Registered for ${event.name}`,
        date: event.dateCreated,
        community: event.communityId.name
      })),
      ...user.certificates.map(cert => ({
        type: 'certificate_earned',
        title: `Earned certificate for ${cert.eventId?.name || 'event'}`,
        date: cert.earnedDate,
        eventId: cert.eventId
      })),
      ...user.badges.map(badge => ({
        type: 'badge_earned',
        title: `Earned ${badge.name} badge`,
        date: badge.earnedDate
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $addFields: {
          eventCount: { $size: '$certificates' },
          badgeCount: { $size: '$badges' },
          totalScore: { $add: [{ $size: '$certificates' }, { $size: '$badges' }] }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 50 },
      {
        $project: {
          name: 1,
          eventCount: 1,
          badgeCount: 1,
          totalScore: 1
        }
      }
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin dashboard stats
router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalEvents = await Event.countDocuments();
    const totalCommunities = await Community.countDocuments();
    
    const adminCommunity = await Community.findOne({ adminId: req.user.userId });
    const myEvents = adminCommunity ? await Event.countDocuments({ communityId: adminCommunity._id }) : 0;

    res.json({
      totalUsers,
      totalEvents,
      totalCommunities,
      myEvents,
      myMembers: adminCommunity ? adminCommunity.members.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;