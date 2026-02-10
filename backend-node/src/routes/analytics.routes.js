const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getAnalytics, getLastCallTime } = require('../controllers/analytics.controller');

router.get('/', authMiddleware, getAnalytics);
router.get('/last-call', authMiddleware, getLastCallTime);

module.exports = router;
