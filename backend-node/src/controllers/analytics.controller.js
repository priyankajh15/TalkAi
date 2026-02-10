const CallLog = require('../models/CallLog.model');

exports.getAnalytics = async (req, res) => {
  try {
    const { days = 7, botName } = req.query;
    const companyId = req.user.companyId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = { companyId, createdAt: { $gte: startDate } };
    if (botName && botName !== 'all') query.botName = botName;

    const calls = await CallLog.find(query).sort({ createdAt: 1 });

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const uniqueAssistants = [...new Set(calls.map(c => c.botName).filter(Boolean))].length;

    const chartData = {};
    calls.forEach(call => {
      const date = new Date(call.createdAt);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!chartData[formattedDate]) {
        chartData[formattedDate] = { date: formattedDate, calls: 0, duration: 0 };
      }
      chartData[formattedDate].calls++;
      chartData[formattedDate].duration += call.duration || 0;
    });

    const chartArray = Object.values(chartData).map(d => ({
      ...d,
      avgDuration: d.calls > 0 ? parseFloat((d.duration / d.calls / 60).toFixed(2)) : 0
    }));

    const assistantsList = [...new Set(calls.map(c => c.botName).filter(Boolean))];

    res.json({
      totalCalls,
      totalDuration: (totalDuration / 60).toFixed(1),
      avgDuration: (avgDuration / 60).toFixed(2),
      totalAssistants: uniqueAssistants,
      chartData: chartArray,
      assistants: assistantsList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLastCallTime = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const lastCall = await CallLog.findOne({ companyId }).sort({ createdAt: -1 }).select('createdAt');
    
    res.json({ lastCallTime: lastCall?.createdAt || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
