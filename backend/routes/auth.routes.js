const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// @route POST /api/auth/signup
router.post('/signup', signup);

// @route POST /api/auth/login
router.post('/login', login);

// @route GET /api/auth/me
router.get('/me', protect, getMe);

// @route GET /api/auth/users (all users for dropdowns)
router.get('/users', protect, getAllUsers);

module.exports = router;
