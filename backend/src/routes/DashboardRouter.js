const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Chỉ Admin mới được xem thống kê
router.get('/stats', authMiddleware, DashboardController.getAllStats);

module.exports = router;