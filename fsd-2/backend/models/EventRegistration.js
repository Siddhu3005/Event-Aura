const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collegeName: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String },
  teamName: { type: String },
  status: { type: String, default: 'registered' },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);