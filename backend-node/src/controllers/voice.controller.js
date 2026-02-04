const twilio = require('twilio');
const logger = require('../config/logger');
const CallLog = require('../models/CallLog.model');
const KnowledgeBase = require('../models/KnowledgeBase.model');
const callDataService = require('../services/callData.service'); //  ADD THIS LINE

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Initiate AI voice call with custom information
 */
exports.makeVoiceCall = async (req, res) => {
  try {
    // Security: Remove sensitive data from logs in production
    if (process.env.NODE_ENV === 'development') {
      console.log('User from req:', { userId: req.user?.userId, role: req.user?.role });
    }
    
    const { 
      targetNumber, 
      callInformation, 
      companyName,
      escalationNumber 
    } = req.body;

    // Format phone number properly
    let formattedNumber = targetNumber;
    if (!formattedNumber.startsWith('+')) {
      // Add country code if missing
      if (formattedNumber.startsWith('91')) {
        formattedNumber = `+${formattedNumber}`;
      } else if (formattedNumber.length === 10) {
        formattedNumber = `+91${formattedNumber}`;
      } else {
        formattedNumber = `+91${formattedNumber}`;
      }
    }
    
    console.log('Original number:', targetNumber);
    console.log('Formatted number:', formattedNumber);

    // Environment-based URL selection
    const isProduction = process.env.NODE_ENV === 'production';
    const webhookUrl = `${isProduction ? process.env.BASE_URL_PROD : process.env.BASE_URL_LOCAL}/api/voice/handle-call`;
    
    // Get company's knowledge base data with smart chunking
    let knowledgeBase = [];
    try {
      const companyKnowledge = await KnowledgeBase.find({
        companyId: req.user?.companyId,
        isActive: true,
        content: { $not: /Text extraction failed/ } // Exclude failed extractions
      }).select('title content category');
      
      //  NEW: Smart chunking for long documents
      knowledgeBase = companyKnowledge.flatMap(kb => {
        const content = kb.content;
        const chunkSize = 1500; // ~300 words per chunk
        const chunks = [];
        
        // Split long documents into searchable chunks
        if (content.length > chunkSize) {
          // Split by paragraphs first
          const paragraphs = content.split(/\n\n+/);
          let currentChunk = '';
          
          for (const para of paragraphs) {
            if (currentChunk.length + para.length > chunkSize && currentChunk) {
              chunks.push({
                title: kb.title,
                content: currentChunk.trim(),
                category: kb.category,
                chunk_id: chunks.length + 1
              });
              currentChunk = para;
            } else {
              currentChunk += '\n\n' + para;
            }
          }
          
          // Add remaining content
          if (currentChunk) {
            chunks.push({
              title: kb.title,
              content: currentChunk.trim(),
              category: kb.category,
              chunk_id: chunks.length + 1
            });
          }
        } else {
          // Small documents - keep as is
          chunks.push({
            title: kb.title,
            content: content,
            category: kb.category,
            chunk_id: 1
          });
        }
        
        return chunks;
      });
      
      console.log(`Processed ${knowledgeBase.length} KB chunks from ${companyKnowledge.length} documents`);
    } catch (kbError) {
      console.error('Failed to fetch knowledge base:', kbError.message);
    }

    //  Prepare complete call data
    const callData = {
      information: callInformation,
      companyName: companyName || 'Your Company',
      companyId: req.user?.companyId,
      receiverName: req.body.receiverName,
      escalationNumber: escalationNumber || req.body.escalationNumber,
      knowledgeBase: knowledgeBase, // Include PDF knowledge
      voiceSettings: req.body.voiceSettings || {
        personality: 'priyanshu',
        language: 'auto',
        model: 'gpt-4-mini',
        stt: 'azure'
      }
    };

    // Encode call data in webhook URL
    const callDataEncoded = Buffer.from(JSON.stringify(callData)).toString('base64');

    // Initiate the call with data in URL
    const call = await client.calls.create({
      url: `${webhookUrl}?data=${encodeURIComponent(callDataEncoded)}`,
      to: formattedNumber,
      from: twilioNumber,
      method: 'POST',
      statusCallback: `${webhookUrl}/status`, // Add status callback
      statusCallbackEvent: ['completed', 'failed', 'no-answer']
    });
    
    //  STORE CALL DATA IN MEMORY (Critical fix!)
    callDataService.storeCallData(call.sid, callData);
    
    console.log('Voice call initiated:', call.sid);

    // Create call log entry
    try {
      const personality = req.body.voiceSettings?.personality || 'priyanshu';
      const botName = personality.charAt(0).toUpperCase() + personality.slice(1);
      
      await CallLog.create({
        companyId: req.user?.companyId || '507f1f77bcf86cd799439011',
        callId: call.sid,
        callerNumber: twilioNumber,
        receiverNumber: formattedNumber,
        botName: botName,
        startTime: new Date(),
        handledBy: 'AI'
      });
    } catch (logError) {
      console.error('Failed to create call log:', logError.message);
    }

    return res.json({
      success: true,
      data: {
        callSid: call.sid,
        status: call.status,
        targetNumber,
        message: 'Voice call initiated successfully'
      }
    });

  } catch (error) {
    console.error('Voice call error:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to initiate voice call',
      error: error.message
    });
  }
};

/**
 * Handle incoming Twilio webhook for voice call
 */
exports.handleVoiceCall = async (req, res) => {
  try {
    const { CallSid, From, To } = req.body;
    
    console.log('=== PHONE CALL WEBHOOK ===');
    console.log('CallSid:', CallSid);
    console.log('From:', From);
    console.log('To:', To);
    
    // GET CALL DATA FROM MEMORY (Primary source)
    let callData = callDataService.getCallData(CallSid);
    
    // Fallback: Try to get from URL if not in memory
    if (!callData) {
      console.log('Call data not in memory, trying URL parameter...');
      try {
        const dataParam = req.query.data;
        if (dataParam) {
          const decodedData = Buffer.from(decodeURIComponent(dataParam), 'base64').toString('utf8');
          callData = JSON.parse(decodedData);
          // Store it now for future responses
          callDataService.storeCallData(CallSid, callData);
          console.log('Call data retrieved from URL and stored in memory');
        }
      } catch (error) {
        console.error('Failed to decode call data from URL:', error.message);
      }
    }
    
    console.log('Call data found:', !!callData);
    console.log('Knowledge base items:', callData?.knowledgeBase?.length || 0);
    
    let message = 'Hello! This is a test message from TalkAI. Thank you for calling.';
    
    if (callData && callData.information) {
      message = generateProfessionalPrompt(callData);
      console.log('Using custom message with KB context');
    } else {
      console.log('No call data found, using default message');
    }
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Use voice settings from call data
    const voiceSettings = callData?.voiceSettings || { personality: 'priyanshu' };
    const selectedVoice = getVoiceForPersonality(voiceSettings.personality);
    
    console.log('Selected voice:', selectedVoice);
    
    twiml.say({
      voice: selectedVoice.voice,
      language: selectedVoice.language
    }, message);
    
    // Ask for response and listen
    const gather = twiml.gather({
      input: 'speech',
      timeout: 5,
      speechTimeout: 3,
      action: '/api/voice/handle-response',
      method: 'POST'
    });
    
    gather.say({
      voice: selectedVoice.voice,
      language: selectedVoice.language
    }, 'What do you think about this? Are you interested or do you have any questions?');
    
    // Fallback if no response
    twiml.say({
      voice: selectedVoice.voice,
      language: selectedVoice.language
    }, 'I didn\'t hear a response. Thank you for your time!');
    
    twiml.hangup();
    
    console.log('TwiML generated successfully');
    res.type('text/xml');
    res.send(twiml.toString());
    
  } catch (error) {
    console.error('=== PHONE CALL WEBHOOK ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    // Send basic TwiML response even on error
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Hello, thank you for calling. We are experiencing technical difficulties.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Handle user response during call
 */
exports.handleVoiceResponse = async (req, res) => {
  try {
    const { CallSid, SpeechResult } = req.body;
    const userResponse = SpeechResult || '';

    console.log('=== HANDLING USER RESPONSE ===');
    console.log('CallSid:', CallSid);
    console.log('User said:', userResponse);

    // GET CALL DATA FROM MEMORY (Critical fix - was null before!)
    const callData = callDataService.getCallData(CallSid);
    
    if (!callData) {
      console.error(`No call data found for ${CallSid}`);
      // Fallback response
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Thank you for your response. Our team will be happy to assist you further. Have a great day!');
      twiml.hangup();
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    console.log(`Call data retrieved successfully`);
    console.log(`KB items available: ${callData.knowledgeBase?.length || 0}`);
    console.log(`Conversation count: ${callDataService.getConversationCount(CallSid)}`);

    const twiml = new twilio.twiml.VoiceResponse();

    // Check for escalation keywords first
    const escalationKeywords = ['human', 'representative', 'agent', 'team', 'transfer', 'connect me', 'talk to someone', 'speak to someone'];
    const wantsEscalation = escalationKeywords.some(keyword => 
      userResponse.toLowerCase().includes(keyword)
    );
    
    if (wantsEscalation) {
      console.log('User requested escalation');
      
      const voiceSettings = callData?.voiceSettings || {};
      const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
      
      if (callData?.escalationNumber) {
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Absolutely! I\'ll connect you with one of our technical specialists right away. Please hold on while I transfer you.');
        
        let dialNumber = callData.escalationNumber;
        if (!dialNumber.startsWith('+')) {
          dialNumber = dialNumber.startsWith('91') ? `+${dialNumber}` : `+91${dialNumber}`;
        }
        
        const dial = twiml.dial({
          timeout: 30,
          callerId: twilioNumber
        });
        dial.number(dialNumber);
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'I was unable to connect you at this time. Please call our main number for assistance.');
      } else {
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'I understand you\'d like to speak with our team. Let me take your contact information so our specialists can call you back within 24 hours.');
        
        const gather = twiml.gather({
          input: 'speech',
          timeout: 10,
          action: '/api/voice/collect-callback',
          method: 'POST'
        });
        
        gather.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Please tell me your name and the best phone number to reach you.');
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Thank you. Our team will contact you soon. Have a great day!');
      }
    } else {
      // Generate AI response WITH FULL CONTEXT
      try {
        console.log('Generating AI response...');
        
        const enhancedCallData = {
          ...callData,
          callSid: CallSid
        };
        
        const aiResponse = await generateContextualResponse(userResponse, enhancedCallData);
      
        console.log('AI response generated:', aiResponse.substring(0, 100) + '...');
        
        // Store conversation exchange in memory
        callDataService.addConversationExchange(
          CallSid, 
          userResponse, 
          aiResponse,
          callData.voiceSettings?.language || 'auto'
        );
        
        const voiceSettings = callData?.voiceSettings || {};
        const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, aiResponse);

        // Check conversation count for natural escalation
        const conversationCount = callDataService.getConversationCount(CallSid);
        console.log(`Conversation exchanges: ${conversationCount}`);
        
        if (conversationCount >= 5) {
          // After 5 exchanges, offer escalation
          console.log('Suggesting escalation after 5 exchanges');
          twiml.say({
            voice: selectedVoice.voice,
            language: selectedVoice.language
          }, 'Would you like me to connect you with our technical team for more detailed assistance?');
          
          const gather = twiml.gather({
            input: 'speech',
            timeout: 4,
            speechTimeout: 2,
            action: '/api/voice/handle-response',
            method: 'POST'
          });
          
          gather.say({
            voice: selectedVoice.voice,
            language: selectedVoice.language
          }, 'Please say yes if you would like to speak with someone, or no to continue with me.');
        } else {
          // Continue conversation
          const gather = twiml.gather({
            input: 'speech',
            timeout: 4,
            speechTimeout: 2,
            action: '/api/voice/handle-response',
            method: 'POST'
          });

          gather.say({
            voice: selectedVoice.voice,
            language: selectedVoice.language
          }, 'Is there anything else you\'d like to know?');

          twiml.say({
            voice: selectedVoice.voice,
            language: selectedVoice.language
          }, 'Thank you for your time. Have a great day!');
        }
      } catch (error) {
        console.error('AI response generation failed:', error.message);
        
        const voiceSettings = callData?.voiceSettings || {};
        const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Thank you for your response. Our team will be happy to assist you further. Have a great day!');
      }
    }

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Voice response handler error:', error.message);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you for your time. Have a great day!');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Generate professional AI prompt from call information
 */
function generateProfessionalPrompt(callData) {
  const { information, companyName, voiceSettings } = callData;
  const personality = voiceSettings?.personality || 'priyanshu';
  
  // Personality introductions with their unique styles
  const personalityIntros = {
    priyanshu: `Hello! I'm Priyanshu calling on behalf of ${companyName}. ${information} I wanted to reach out to discuss this with you and see how we can assist you further.`,
    tanmay: `Hey there! I'm Tanmay from ${companyName}! ${information} This is super exciting and I'd love to chat with you about it!`,
    ekta: `Good day! I am Ekta calling on behalf of ${companyName}. ${information} I would be pleased to discuss this opportunity with you in detail.`,
    priyanka: `Hello! I'm Priyanka from ${companyName}. ${information} From a technical perspective, I'd like to discuss how this can benefit your infrastructure.`
  };
  
  return personalityIntros[personality] || personalityIntros.priyanshu;
}

/**
 * Generate contextual response using Phase 3 Python AI backend
 */
async function generateContextualResponse(userResponse, callData) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const AI_BACKEND_URL = isProduction 
      ? process.env.AI_BACKEND_URL_PROD 
      : process.env.AI_BACKEND_URL_LOCAL;
    
    const axios = require('axios');
    
    const requestData = {
      user_message: userResponse,
      call_data: callData,
      voice_settings: callData?.voiceSettings,
      call_sid: callData?.callSid,
      knowledge_base: callData?.knowledgeBase || []
    };
    
    const response = await axios.post(`${AI_BACKEND_URL}/voice/voice-response`, requestData, {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Update call log if abusive content detected
    if (response.data.abusive_detected) {
      try {
        await CallLog.findOneAndUpdate(
          { callId: CallSid },
          { abusiveDetected: true },
          { new: true }
        );
      } catch (updateError) {
        console.error('Failed to update call log for abusive content:', updateError.message);
      }
    }
    
    return response.data.ai_response;
    
  } catch (error) {
    console.error('AI backend request failed:', error.message);
    
    // Enhanced fallback with personality
    const personality = callData?.voiceSettings?.personality || 'priyanshu';
    const fallbacks = {
      priyanshu: "Thank you for your response. Our cloud solutions can definitely help your business. Would you like me to connect you with our technical team?",
      tanmay: "That's awesome! Our cloud services can totally help you out. Want to chat with our tech experts?",
      ekta: "Thank you for your inquiry. Our cloud solutions offer exceptional value. May I connect you with our technical team?",
      priyanka: "From a technical perspective, our cloud infrastructure can benefit your business. Shall I connect you with our solutions architect?"
    };
    return fallbacks[personality] || fallbacks.priyanshu;
  }
}

/**
 * Get Twilio voice settings for personality
 */
function getVoiceForPersonality(personality) {
  const voiceMap = {
    priyanshu: { voice: 'man', language: 'en-IN' },        // Male, Professional
    tanmay: { voice: 'man', language: 'en-IN' },           // Male, Energetic  
    ekta: { voice: 'woman', language: 'en-IN' },           // Female, Formal
    priyanka: { voice: 'woman', language: 'en-IN' }        // Female, Technical
  };
  
  return voiceMap[personality] || voiceMap.priyanshu;
}

/**
 * Detect language from user speech
 */
function detectLanguage(userResponse, languageSetting) {
  if (languageSetting === 'hi-IN') return 'hindi';
  if (languageSetting === 'en-IN') return 'english';
  
  // Auto detection for 'auto' setting
  const response = userResponse?.toLowerCase() || '';
  const hindiWords = ['hai', 'kya', 'mein', 'aap', 'hum', 'baare', 'ke', 'se', 'main', 'acha', 'accha', 'nahi', 'haan'];
  const hindiCount = hindiWords.filter(word => response.includes(word)).length;
  
  return hindiCount >= 2 ? 'hindi' : 'english';
}

/**
 * Handle callback information collection
 */
exports.collectCallback = async (req, res) => {
  try {
    const { CallSid, SpeechResult } = req.body;
    const callData = null; // No call data available in callback handler
    const contactInfo = SpeechResult || '';

    console.log('Callback info collected:', contactInfo);
    
    // Here you could save to database or send email notification
    // For now, just log it
    console.log('Contact info for callback:', {
      callSid: CallSid,
      contactInfo: contactInfo,
      originalMessage: callData?.information,
      companyName: callData?.companyName
    });

    const voiceSettings = callData?.voiceSettings || {};
    const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: selectedVoice.voice,
      language: selectedVoice.language
    }, 'Perfect! I have your contact information. Our technical team will reach out to you within 24 hours to discuss your requirements. Thank you for your interest!');
    
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Callback collection error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your time. Our team will be in touch soon.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Handle call status updates from Twilio
 */
exports.handleCallStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    console.log(`Call ${CallSid} status: ${CallStatus}`);
    
    if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'no-answer') {
      // Update call log with final status
      try {
        await CallLog.findOneAndUpdate(
          { callId: CallSid },
          { 
            endTime: new Date(),
            duration: CallDuration ? parseInt(CallDuration) : null,
            status: CallStatus
          }
        );
        console.log(`Updated call log for ${CallSid}`);
      } catch (logError) {
        console.error('Failed to update call log:', logError.message);
      }
      
      // Clean up call data from memory
      callDataService.removeCallData(CallSid);
      
      // Log stats
      const stats = callDataService.getStats();
      console.log(`Active calls: ${stats.activeCalls}`);
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Call status handler error:', error);
    res.sendStatus(500);
  }
};

module.exports = exports;