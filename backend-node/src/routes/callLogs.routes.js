const express = require('express');
const router = express.Router();
const { getCallLogs, createCallLog, updateCallLog } = require('../controllers/callLogs.controller');
const auth = require('../middleware/auth.middleware');

// Get call logs with pagination
router.get('/call-logs', auth, getCallLogs);

// Create new call log
router.post('/call-logs', auth, createCallLog);

// Update call log by callSid
router.put('/call-logs/:callSid', auth, updateCallLog);

module.exports = router;