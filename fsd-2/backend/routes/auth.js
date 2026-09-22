const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { authLimiter, csrfProtection } = require('../middleware/security');

const router = express.Router();

// Register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, collegeName, adminSecret } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Admin validation
    if (role === 'admin') {
      if (!collegeName) {
        return res.status(400).json({ message: 'College name is required for admin' });
      }
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(400).json({ message: 'Invalid admin secret code' });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      collegeName: role === 'admin' ? collegeName : undefined
    });

    await user.save();

    // Create community for admin
    if (role === 'admin') {
      const community = new Community({
        name: `${collegeName} Community`,
        collegeName,
        adminId: user._id,
        members: [user._id]
      });
      await community.save();
      user.communitiesJoined.push(community._id);
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;