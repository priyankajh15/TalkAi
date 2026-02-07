const CallLog = require('../models/CallLog.model');

// Get call logs with pagination (company-specific)
const getCallLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Filter by authenticated user's companyId
    const companyId = req.user.companyId;

    const callLogs = await CallLog.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CallLog.countDocuments({ companyId });

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
    
    res.json({
      success: true,
      data: {
        recording_url: callLog.recordingUrl,
        recording_sid: callLog.recordingSid
      }
    });
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