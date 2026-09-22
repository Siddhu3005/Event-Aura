const express = require('express');
const Event = require('../models/Event');
const Community = require('../models/Community');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { eventValidation } = require('../middleware/validation');
const { csrfProtection } = require('../middleware/security');

const router = express.Router();

// Create event (Admin only)
router.post('/', verifyToken, verifyRole('admin'), eventValidation, async (req, res) => {
  try {
    const { 
      name, 
      startDate, 
      endDate, 
      registrationDeadline, 
      location, 
      attendanceProvided, 
      certificatesProvided, 
      theme, 
      description, 
      prizes, 
      communityId 
    } = req.body;

    // Validation
    if (!name || !startDate || !endDate || !registrationDeadline || !location || !theme || !description) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (deadline >= start) {
      return res.status(400).json({ message: 'Registration deadline must be before start date' });
    }

    // Validate prizes
    if (prizes && prizes.length > 0) {
      for (let prize of prizes) {
        if (prize.amount <= 0) {
          return res.status(400).json({ message: 'Prize amount must be greater than 0' });
        }
      }
    }

    const community = await Community.findById(communityId);
    if (!community || community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to create events for this community' });
    }

    const event = new Event({
      name,
      startDate,
      endDate,
      registrationDeadline,
      location,
      attendanceProvided: attendanceProvided || false,
      certificatesProvided: certificatesProvided || false,
      theme,
      description,
      prizes: prizes || [],
      communityId
    });

    await event.save();

    community.events.push(event._id);
    await community.save();

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const { theme, search } = req.query;
    let filter = {};
    
    if (theme) filter.theme = theme;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('communityId', 'name collegeName')
      .populate('participants', 'name');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('communityId', 'name collegeName')
      .populate('participants', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.communitiesJoined.includes(event.communityId._id)) {
      return res.status(403).json({ message: 'Must join community first' });
    }

    if (event.participants.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline passed' });
    }

    event.participants.push(req.user.userId);
    await event.save();

    // Award badge for first event
    const userEventCount = await Event.countDocuments({ participants: req.user.userId });
    if (userEventCount === 1) {
      await User.findByIdAndUpdate(req.user.userId, {
        $push: { badges: { name: 'First Event', earnedDate: new Date() } }
      });
    }

    res.json({ 
      message: 'Registered successfully',
      eventId: event._id,
      eventName: event.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unregister from event
router.delete('/:id/unregister', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Cannot unregister after deadline' });
    }

    event.participants = event.participants.filter(p => p.toString() !== req.user.userId);
    await event.save();

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance (Admin only)
router.post('/:id/attendance', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { participantIds } = req.body;
    const event = await Event.findById(req.params.id).populate('communityId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate certificates for attended participants
    if (event.certificatesProvided) {
      for (const participantId of participantIds) {
        await User.findByIdAndUpdate(participantId, {
          $push: { 
            certificates: { 
              eventId: event._id, 
              downloadUrl: `certificate_${event._id}_${participantId}.pdf`,
              earnedDate: new Date() 
            }
          }
        });

        // Award badges
        const user = await User.findById(participantId);
        const certificateCount = user.certificates.length + 1;
        
        if (certificateCount === 5) {
          await User.findByIdAndUpdate(participantId, {
            $push: { badges: { name: '5 Events Completed', earnedDate: new Date() } }
          });
        }
        if (certificateCount === 10) {
          await User.findByIdAndUpdate(participantId, {
            $push: { badges: { name: 'Event Master', earnedDate: new Date() } }
          });
        }
      }
    }

    res.json({ message: 'Attendance marked and certificates generated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit event (Admin only)
router.put('/:id', verifyToken, verifyRole('admin'), eventValidation, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if event has already started
    if (new Date() >= new Date(event.startDate)) {
      return res.status(400).json({ message: 'Cannot edit event after it has started' });
    }

    const { name, startDate, endDate, registrationDeadline, location, theme, description, prizes } = req.body;

    // Update event fields
    if (name) event.name = name;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;
    if (location) event.location = location;
    if (theme) event.theme = theme;
    if (description) event.description = description;
    if (prizes) event.prizes = prizes;

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get registration link (Admin only)
router.get('/:id/registration-link', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/event/${event._id}`;
    res.json({ registrationLink, eventName: event.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Community.findByIdAndUpdate(event.communityId._id, {
      $pull: { events: event._id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;