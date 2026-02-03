/**
 * In-memory storage for active call data
 * This preserves KB and context across call responses
 */
class CallDataService {
  constructor() {
    this.activeCalls = new Map();
  }

  /**
   * Store call data when call is initiated
   */
  storeCallData(callSid, callData) {
    this.activeCalls.set(callSid, {
      ...callData,
      conversationHistory: [],
      startTime: new Date(),
      responseCount: 0
    });
    
    console.log(` Stored call data for ${callSid}`);
    console.log(` KB items: ${callData.knowledgeBase?.length || 0}`);
  }

  /**
   * Get call data for ongoing call
   */
  getCallData(callSid) {
    const data = this.activeCalls.get(callSid);
    if (!data) {
      console.warn(` No call data found for ${callSid}`);
    } else {
      console.log(` Retrieved call data for ${callSid}`);
    }
    return data;
  }

  /**
   * Add conversation exchange to history
   */
  addConversationExchange(callSid, userMessage, aiResponse, language) {
    const callData = this.activeCalls.get(callSid);
    if (callData) {
      callData.conversationHistory.push({
        user: userMessage,
        ai: aiResponse,
        language: language,
        timestamp: new Date()
      });
      callData.responseCount++;
      
      console.log(` Conversation exchange added (${callData.responseCount} total)`);
      
      // Keep only last 10 exchanges
      if (callData.conversationHistory.length > 10) {
        callData.conversationHistory = callData.conversationHistory.slice(-10);
      }
    }
  }

  /**
   * Clean up call data after call ends
   */
  removeCallData(callSid) {
    const existed = this.activeCalls.delete(callSid);
    if (existed) {
      console.log(` Removed call data for ${callSid}`);
    }
  }

  /**
   * Auto-cleanup: Remove calls older than 1 hour
   */
  cleanupOldCalls() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [callSid, data] of this.activeCalls.entries()) {
      if (data.startTime.getTime() < oneHourAgo) {
        this.removeCallData(callSid);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(` Cleaned up ${cleanedCount} old calls`);
    }
  }

  /**
   * Get conversation count for call
   */
  getConversationCount(callSid) {
    const data = this.activeCalls.get(callSid);
    return data ? data.responseCount : 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeCalls: this.activeCalls.size,
      calls: Array.from(this.activeCalls.entries()).map(([sid, data]) => ({
        callSid: sid,
        responseCount: data.responseCount,
        duration: Math.floor((Date.now() - data.startTime.getTime()) / 1000),
        kbItems: data.knowledgeBase?.length || 0
      }))
    };
  }
}

// Singleton instance
const callDataService = new CallDataService();

// Auto-cleanup every 10 minutes
setInterval(() => {
  callDataService.cleanupOldCalls();
}, 10 * 60 * 1000);

module.exports = callDataService;