const express = require('express');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Student registration with detailed form
router.post('/:eventId/register', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const { collegeName, yearOfStudy, phone, resumeUrl, teamName } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    const existing = await EventRegistration.findOne({ eventId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const registration = new EventRegistration({
      eventId,
      userId,
      collegeName,
      yearOfStudy,
      phone,
      resumeUrl,
      teamName,
    });

    await registration.save();

    // Add to event participants if not already there
    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
      await event.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      registration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin view registrations
router.get('/:eventId/registrations', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await EventRegistration.find({ eventId })
      .populate('userId', 'name email')
      .sort({ registeredAt: -1 });
    
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;