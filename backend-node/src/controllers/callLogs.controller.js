const CallLog = require('../models/CallLog.model');

// Get call logs with pagination
const getCallLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const callLogs = await CallLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CallLog.countDocuments();

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

// Update call log
const updateCallLog = async (req, res) => {
  try {
    const { callId } = req.params;
    const updates = req.body;
    
    const callLog = await CallLog.findOneAndUpdate(
      { callId },
      updates,
      { new: true, upsert: true }
    );
    
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

module.exports = {
  getCallLogs,
  createCallLog,
  updateCallLog,
  CallLog
};