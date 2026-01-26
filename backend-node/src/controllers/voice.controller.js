const twilio = require('twilio');
const logger = require('../config/logger');

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

    // Validate required fields
    if (!targetNumber || !callInformation) {
      return res.status(400).json({
        success: false,
        message: 'Target number and call information are required'
      });
    }

    // Environment-based URL selection
    const isProduction = process.env.NODE_ENV === 'production';
    const webhookUrl = `${isProduction ? process.env.BASE_URL_PROD : process.env.BASE_URL_LOCAL}/api/voice/handle-call`;
    
    // Encode call data in webhook URL
    const callDataEncoded = Buffer.from(JSON.stringify({
      information: callInformation,
      companyName: companyName || 'Your Company',
      receiverName: req.body.receiverName,
      escalationNumber: escalationNumber || req.body.escalationNumber,
      voiceSettings: req.body.voiceSettings || {
        personality: 'priyanshu',
        language: 'auto',
        model: 'gpt-4-mini',
        stt: 'azure'
      }
    })).toString('base64');

    // Initiate the call with data in URL
    const call = await client.calls.create({
      url: `${webhookUrl}?data=${encodeURIComponent(callDataEncoded)}`,
      to: targetNumber,
      from: twilioNumber,
      method: 'POST'
    });
    
    // Security: Log minimal data only
    if (process.env.NODE_ENV === 'development') {
      console.log('Call data stored for CallSid:', call.sid);
    }

    logger.info('Voice call initiated', {
      callSid: call.sid,
      targetNumber: targetNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
      userId: req.user?.id || 'unknown'
    });

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
    logger.error('Voice call error', {
      error: error.message,
      userId: req.user?.id
    });

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
    
    // Enhanced logging for phone call debugging
    console.log('=== PHONE CALL WEBHOOK ===');
    console.log('CallSid:', CallSid);
    console.log('From:', From);
    console.log('To:', To);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Get call data from URL parameter
    let callData = null;
    try {
      const dataParam = req.query.data;
      if (dataParam) {
        const decodedData = Buffer.from(decodeURIComponent(dataParam), 'base64').toString('utf8');
        callData = JSON.parse(decodedData);
        console.log('Call data retrieved from URL:', !!callData);
      }
    } catch (error) {
      console.error('Failed to decode call data from URL:', error.message);
    }
    console.log('Call data found:', !!callData);
    
    let message = 'Hello! This is a test message from TalkAI. Thank you for calling.';
    
    if (callData && callData.information) {
      message = generateProfessionalPrompt(callData);
      console.log('Using custom message for phone call');
    } else {
      console.log('No call data found, using default message');
    }
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Use default voice settings if no call data
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
    
    console.log('TwiML generated successfully for phone call');
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
    const callData = null; // No call data available in response handler
    const userResponse = SpeechResult || '';

    // Security: Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('User response received for CallSid:', CallSid);
      console.log('User said:', userResponse);
    }

    const twiml = new twilio.twiml.VoiceResponse();

    // Check for escalation keywords first
    if (userResponse.toLowerCase().includes('human') || 
        userResponse.toLowerCase().includes('representative') || 
        userResponse.toLowerCase().includes('agent') ||
        userResponse.toLowerCase().includes('team') ||
        userResponse.toLowerCase().includes('transfer') ||
        userResponse.toLowerCase().includes('connect me')) {
      
      const voiceSettings = callData?.voiceSettings || {};
      const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
      
      if (callData?.escalationNumber) {
        // Transfer to human agent
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Absolutely! I\'ll connect you with one of our technical specialists right away. Please hold on while I transfer you.');
        
        console.log('Transferring to escalation number:', callData.escalationNumber);
        let dialNumber = callData.escalationNumber;
        if (!dialNumber.startsWith('+')) {
          dialNumber = dialNumber.startsWith('91') ? `+${dialNumber}` : `+91${dialNumber}`;
        }
        console.log('Dialing formatted number:', dialNumber);
        
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
        // No escalation number provided - collect contact info
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
      // Generate AI response based on user input using Phase 3 Python AI
      try {
        // Add call_sid to callData for conversation memory
        const enhancedCallData = {
          ...callData,
          callSid: CallSid
        };
        
        const aiResponse = await generateContextualResponse(userResponse, enhancedCallData);
        console.log('Phase 3 AI responding with:', aiResponse);
        
        const voiceSettings = callData?.voiceSettings || {};
        const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, aiResponse);

        // Ask if they need anything else
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

        // Final fallback
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Thank you for your time. Have a great day!');
      } catch (error) {
        console.error('AI response generation failed:', error);
        
        const voiceSettings = callData?.voiceSettings || {};
        const selectedVoice = getVoiceForPersonality(voiceSettings.personality || 'priyanshu');
        
        twiml.say({
          voice: selectedVoice.voice,
          language: selectedVoice.language
        }, 'Thank you for your response. Our team will be happy to assist you further. Have a great day!');
      }
    }

    twiml.hangup();

    console.log('Sending TwiML:', twiml.toString());
    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Voice response handling error:', error);

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
    // Environment-based URL selection
    const isProduction = process.env.NODE_ENV === 'production';
    const AI_BACKEND_URL = isProduction 
      ? process.env.AI_BACKEND_URL_PROD 
      : process.env.AI_BACKEND_URL_LOCAL;
    
    const axios = require('axios');
    
    console.log('Calling Phase 3 Python AI backend...');
    const response = await axios.post(`${AI_BACKEND_URL}/voice/voice-response`, {
      user_message: userResponse,
      call_data: callData,
      voice_settings: callData?.voiceSettings,
      call_sid: callData?.callSid  // Phase 3: Pass call_sid for conversation memory
    }, {
      timeout: 8000  // Increased timeout for LLM processing
    });
    
    console.log('Phase 3 AI response:', {
      response: response.data.ai_response,
      language: response.data.detected_language,
      sentiment: response.data.sentiment.label,
      confidence: response.data.language_confidence,
      context_used: response.data.context_used
    });
    
    return response.data.ai_response;
    
  } catch (error) {
    console.error('Phase 3 Python AI failed:', error.message);
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

module.exports = exports;