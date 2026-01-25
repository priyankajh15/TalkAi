const axios = require('axios');
const KnowledgeBase = require('../models/KnowledgeBase.model');
const logger = require('../config/logger');

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

/**
 * Chat with AI using knowledge base context
 */
exports.chat = async (req, res) => {
  try {
    const { message, company_name } = req.body;
    const companyId = req.user.companyId;

    // Search knowledge base for relevant articles (escape regex special characters)
    const escapedMessage = message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const knowledgeArticles = await KnowledgeBase.find({
      companyId,
      isActive: true,
      $or: [
        { title: { $regex: escapedMessage, $options: 'i' } },
        { content: { $regex: escapedMessage, $options: 'i' } }
      ]
    }).limit(3);

    // Forward to AI backend with knowledge context
    const aiResponse = await axios.post(`${AI_BACKEND_URL}/ai/chat`, {
      message,
      company_name: company_name || 'Your Company',
      knowledge_articles: knowledgeArticles,
      company_info: {
        name: company_name || 'Your Company',
        business_hours: '9 AM - 6 PM EST'
      }
    });

    return res.json({
      success: true,
      data: {
        ai_response: aiResponse.data.ai_response,
        confidence: aiResponse.data.confidence || 0.95,
        knowledge_used: knowledgeArticles.length > 0,
        knowledge_count: knowledgeArticles.length
      }
    });

  } catch (error) {
    logger.error('AI chat error', {
      requestId: req.id,
      error: error.message,
      message: req.body?.message
    });

    return res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable',
      requestId: req.id
    });
  }
};

/**
 * Get available voices
 */
exports.getVoices = async (req, res) => {
  try {
    const aiResponse = await axios.get(`${AI_BACKEND_URL}/ai/voices`);
    
    return res.json({
      success: true,
      data: aiResponse.data
    });

  } catch (error) {
    logger.error('Get voices error', {
      requestId: req.id,
      error: error.message
    });

    return res.status(500).json({
      success: false,
      message: 'Voice service temporarily unavailable',
      requestId: req.id
    });
  }
};

/**
 * Synthesize speech
 */
exports.synthesize = async (req, res) => {
  try {
    const { text, voice = 'ekta' } = req.body;

    const aiResponse = await axios.post(`${AI_BACKEND_URL}/ai/synthesize`, {
      text,
      voice
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return res.json({
      success: true,
      data: aiResponse.data
    });

  } catch (error) {
    logger.error('Speech synthesis error', {
      requestId: req.id,
      error: error.message,
      text: req.body?.text
    });

    return res.status(500).json({
      success: false,
      message: 'Speech synthesis temporarily unavailable',
      requestId: req.id
    });
  }
};