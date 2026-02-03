const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voice.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Make AI voice call (requires authentication)
router.post('/make-call', authMiddleware, voiceController.makeVoiceCall);

// Handle Twilio webhook for voice call (no auth - webhook)
router.post('/handle-call', express.urlencoded({ extended: true }), voiceController.handleVoiceCall);
router.get('/handle-call', (req, res) => res.send('Voice webhook endpoint is working'));

// Handle voice response during call (no auth - webhook)
router.post('/handle-response', express.urlencoded({ extended: true }), voiceController.handleVoiceResponse);

// Handle callback info collection (no auth - webhook)
router.post('/collect-callback', express.urlencoded({ extended: true }), voiceController.collectCallback);

// NEW: Handle call status updates (no auth - webhook)
router.post('/handle-call/status', express.urlencoded({ extended: true }), voiceController.handleCallStatus);

module.exports = router;