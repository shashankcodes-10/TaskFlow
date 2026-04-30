const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// @route GET /api/dashboard
router.get('/', protect, getDashboardStats);

module.exports = router;
