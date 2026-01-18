const aiService = require('../services/ai.service');
const CallLog = require('../models/CallLog.model');
const Company = require('../models/Company.model');

/**
 * Process text chat with AI
 */
exports.processChat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    
    // Get company info
    const company = await Company.findById(req.user.companyId);
    const companyName = company?.companyName || 'Demo Company';

    // Process with AI
    const aiResult = await aiService.processTextChat(message, companyName, context);

    // Save to call log (optional for text chat)
    const callLog = await CallLog.create({
      companyId: req.user.companyId,
      callId: `chat_${Date.now()}`,
      transcript: message,
      handledBy: 'AI',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0
    });

    res.json({
      success: true,
      data: {
        ...aiResult,
        callLogId: callLog._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process voice call with AI
 */
exports.processVoiceCall = async (req, res, next) => {
  try {
    const { audioBuffer, voice = 'ekta', context = {} } = req.body;
    
    // Get company info
    const company = await Company.findById(req.user.companyId);
    const companyName = company?.companyName || 'Demo Company';

    // Process with AI
    const aiResult = await aiService.processVoiceCall(audioBuffer, companyName, voice, context);

    // Save to call log
    const callLog = await CallLog.create({
      companyId: req.user.companyId,
      callId: `voice_${Date.now()}`,
      transcript: aiResult.transcript,
      handledBy: aiResult.should_escalate ? 'Human' : 'AI',
      escalationReason: aiResult.should_escalate ? 'AI recommended escalation' : null,
      startTime: new Date(),
      endTime: new Date(),
      duration: Math.round(aiResult.total_processing_time)
    });

    res.json({
      success: true,
      data: {
        ...aiResult,
        callLogId: callLog._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available AI voices
 */
exports.getVoices = async (req, res, next) => {
  try {
    const { provider, gender } = req.query;
    const voices = await aiService.getAvailableVoices(provider, gender);

    res.json({
      success: true,
      data: voices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get call logs with AI data
 */
exports.getCallLogs = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      companyId: req.user.companyId
    };

    const [callLogs, total] = await Promise.all([
      CallLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CallLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: callLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get call recording
 */
exports.getCallRecording = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const recording = await aiService.getCallRecording(callId);

    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload PDF to knowledge base
 */
exports.uploadPDF = async (req, res, next) => {
  try {
    // Mock implementation - forward to AI backend later
    res.json({
      success: true,
      data: {
        file_id: `pdf_${Date.now()}`,
        filename: req.file?.originalname || 'document.pdf',
        size: '1.2 MB',
        status: 'processed',
        message: 'PDF uploaded successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add website to knowledge base
 */
exports.addWebsite = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    res.json({
      success: true,
      data: {
        file_id: `web_${Date.now()}`,
        url: url,
        size: '0.5 MB',
        status: 'processed',
        message: 'Website content added successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get knowledge base files
 */
exports.getKnowledgeFiles = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        files: [],
        total_size: '0 MB',
        storage_limit: '10 MB'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete knowledge base file
 */
exports.deleteKnowledgeFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};