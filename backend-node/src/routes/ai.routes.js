const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/ai.controller');

// AI Chat endpoint
router.post('/chat', auth, controller.processChat);

// AI Voice processing endpoint  
router.post('/process-voice', auth, controller.processVoiceCall);

// Get available voices
router.get('/voices', auth, controller.getVoices);

// Get call logs with AI data
router.get('/call-logs', auth, controller.getCallLogs);

// Get call recording
router.get('/recording/:callId', auth, controller.getCallRecording);

// Knowledge base routes
router.post('/knowledge/upload-pdf', auth, controller.uploadPDF);
router.post('/knowledge/add-website', auth, controller.addWebsite);
router.get('/knowledge/files', auth, controller.getKnowledgeFiles);
router.delete('/knowledge/file/:fileId', auth, controller.deleteKnowledgeFile);

module.exports = router;