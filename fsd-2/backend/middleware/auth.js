const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token || token.length < 10) {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Token verification failed' });
  }
};

const verifyRole = (role) => (req, res, next) => {
  try {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Role verification failed' });
  }
};

module.exports = { verifyToken, verifyRole };