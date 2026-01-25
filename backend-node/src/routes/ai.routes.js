const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Chat with AI (requires authentication)
router.post('/chat', authMiddleware, aiController.chat);

// Get available voices (requires authentication)
router.get('/voices', authMiddleware, aiController.getVoices);

// Synthesize speech (requires authentication)
router.post('/synthesize', authMiddleware, aiController.synthesize);

module.exports = router;