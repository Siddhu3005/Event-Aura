const { body, validationResult } = require('express-validator');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6, max: 100 }),
  body('role').isIn(['admin', 'student']),
  body('collegeName').optional().trim().isLength({ min: 0, max: 100 }),
  validateInput
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1, max: 100 }),
  validateInput
];

const eventValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('location').trim().isLength({ min: 2, max: 200 }),
  body('theme').trim().isLength({ min: 2, max: 50 }),
  validateInput
];

module.exports = {
  registerValidation,
  loginValidation,
  eventValidation,
  validateInput
};