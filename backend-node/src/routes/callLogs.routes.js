const express = require('express');
const router = express.Router();
const { getCallLogs, createCallLog, updateCallLog, getRecording } = require('../controllers/callLogs.controller');
const auth = require('../middleware/auth.middleware');

// Get call logs with pagination
router.get('/call-logs', auth, getCallLogs);

// Create new call log
router.post('/call-logs', auth, createCallLog);

// Update call log by callSid
router.put('/call-logs/:callSid', auth, updateCallLog);

// Get recording for a call
router.get('/call-logs/:callId/recording', auth, getRecording);

module.exports = router;