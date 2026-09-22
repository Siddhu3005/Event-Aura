const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  },
  collegeName: {
    type: String,
    required: function() { return this.role === 'admin'; }
  },
  communitiesJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  badges: [{
    name: String,
    earnedDate: { type: Date, default: Date.now }
  }],
  certificates: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    downloadUrl: String,
    earnedDate: { type: Date, default: Date.now }
  }],
  eventPermissions: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    permissions: [String],
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grantedAt: { type: Date, default: Date.now }
  }],
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);