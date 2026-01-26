const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const knowledgeController = require('../controllers/knowledge.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Chat with AI (requires authentication)
router.post('/chat', authMiddleware, aiController.chat);

// Get available voices (requires authentication)
router.get('/voices', authMiddleware, aiController.getVoices);

// Synthesize speech (requires authentication)
router.post('/synthesize', authMiddleware, aiController.synthesize);

// Knowledge base routes
router.post('/knowledge/upload-pdf', authMiddleware, upload.single('file'), knowledgeController.uploadPDF);
router.get('/knowledge/files', authMiddleware, knowledgeController.listItems);
router.delete('/knowledge/file/:id', authMiddleware, knowledgeController.deleteItem);

module.exports = router;