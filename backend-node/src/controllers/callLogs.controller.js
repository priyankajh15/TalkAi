const CallLog = require('../models/CallLog.model');
const mongoose = require('mongoose');

// Get call logs with pagination (company-specific)
const getCallLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Filter by authenticated user's companyId
    const companyId = req.user.companyId;

    const [result] = await CallLog.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      { $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        total: [{ $count: 'count' }]
      }}
    ]);

    const callLogs = result.data;
    const total = result.total[0]?.count || 0;

    res.json({
      success: true,
      data: {
        callLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call logs',
      error: error.message
    });
  }
};

// Create call log entry
const createCallLog = async (req, res) => {
  try {
    const callLog = new CallLog(req.body);
    await callLog.save();
    
    res.json({
      success: true,
      data: callLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create call log',
      error: error.message
    });
  }
};

// Update call log (company-specific)
const updateCallLog = async (req, res) => {
  try {
    const { callId } = req.params;
    const updates = req.body;
    const companyId = req.user.companyId;
    
    const callLog = await CallLog.findOneAndUpdate(
      { callId, companyId }, // Filter by both callId and companyId
      updates,
      { new: true }
    );
    
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found or access denied'
      });
    }
    
    res.json({
      success: true,
      data: callLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update call log',
      error: error.message
    });
  }
};

// Get recording URL for a call
const getRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const companyId = req.user.companyId;
    
    const callLog = await CallLog.findOne({ _id: callId, companyId });
    
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found or access denied'
      });
    }
    
    if (!callLog.recordingUrl) {
      return res.status(404).json({
        success: false,
        message: 'No recording available for this call'
      });
    }
    
    // Proxy the recording through backend to avoid authentication popup
    const axios = require('axios');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    try {
      // Try .mp3 first (Twilio's default format), then .wav
      let recordingUrlWithFormat = callLog.recordingUrl;
      if (!recordingUrlWithFormat.includes('.mp3') && !recordingUrlWithFormat.includes('.wav')) {
        recordingUrlWithFormat = `${callLog.recordingUrl}.mp3`;
      }
      
      const response = await axios.get(recordingUrlWithFormat, {
        auth: {
          username: accountSid,
          password: authToken
        },
        responseType: 'stream'
      });
      
      // Detect content type from response or use mp3 as default
      const contentType = response.headers['content-type'] || 'audio/mpeg';
      
      // Set headers for audio file with CORS
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="recording-${callId}.mp3"`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      
      // Pipe the recording stream to response
      response.data.pipe(res);
      
    } catch (twilioError) {
      console.error('Failed to fetch recording from Twilio:', twilioError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recording from Twilio'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recording',
      error: error.message
    });
  }
};

module.exports = {
  getCallLogs,
  createCallLog,
  updateCallLog,
  getRecording,
  CallLog
};