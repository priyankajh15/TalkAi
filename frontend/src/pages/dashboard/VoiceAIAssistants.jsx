import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faRobot, faUser, faPlay, faPause, faUpload, faPhone, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { toast } from '../../components/Toast';
import api, { voiceAPI } from '../../services/api';

const VoiceAIAssistants = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [selectedVoice, setSelectedVoice] = useState('priyanshu');
  const [selectedModel, setSelectedModel] = useState('gpt-4-mini');
  const [selectedSTT, setSelectedSTT] = useState('azure');
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callData, setCallData] = useState({ receiverName: '', companyName: '', phoneNumber: '', message: '', escalationNumber: '' });
  
  const messagesEndRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const voices = [
    { name: 'priyanshu', gender: 'male', personality: 'Professional, Friendly', description: 'Warm but professional tone' },
    { name: 'tanmay', gender: 'male', personality: 'Casual, Energetic', description: 'Upbeat and conversational' },
    { name: 'ekta', gender: 'female', personality: 'Formal, Polite', description: 'Very respectful and structured' },
    { name: 'priyanka', gender: 'female', personality: 'Technical, Expert', description: 'Detailed technical explanations' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom when messages change, not on initial load
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Show call dialog instead of sending chat message
    setCallData({ ...callData, message: inputMessage });
    setShowCallDialog(true);
  };

  const handleMakeCall = async () => {
    if (!callData.receiverName || !callData.companyName || !callData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await voiceAPI.makeCall({
        targetNumber: callData.phoneNumber,
        callInformation: callData.message,
        companyName: callData.companyName,
        receiverName: callData.receiverName,
        escalationNumber: callData.escalationNumber,
        voiceSettings: {
          personality: selectedVoice,
          language: selectedLanguage,
          model: selectedModel,
          stt: selectedSTT
        }
      });

      if (response.data.success) {
        toast.success(`Voice call initiated to ${callData.receiverName}!`);
        
        // Add call message to chat
        const callMessage = {
          id: Date.now(),
          type: 'user',
          content: `Voice call initiated to ${callData.receiverName} (${callData.phoneNumber})`,
          timestamp: new Date(),
          isCall: true
        };
        setMessages(prev => [...prev, callMessage]);
        
        // Add AI confirmation
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: `Call initiated successfully! The recipient will receive a call with your message: "${callData.message}"`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        setShowCallDialog(false);
        setInputMessage('');
        setCallData({ receiverName: '', companyName: '', phoneNumber: '', message: '', escalationNumber: '' });
      } else {
        toast.error('Failed to initiate call: ' + response.data.message);
      }
    } catch (error) {
      toast.error('Error making call: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVoice = async () => {
    setIsLoading(true);
    try {
      const testMessage = getTestMessage(selectedVoice, selectedLanguage);
      
      // Add test message to chat
      const testChatMessage = {
        id: Date.now(),
        type: 'ai',
        content: ` Testing ${selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)} voice: "${testMessage}"`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, testChatMessage]);
      
      toast.success(`Voice test: ${selectedVoice} would say this message`);
    } catch (error) {
      toast.error('Voice test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestMessage = (personality, language) => {
    const testMessages = {
      priyanshu: {
        auto: "Hello! I'm Priyanshu, your professional and friendly AI assistant.",
        'en-IN': "Hello! I'm Priyanshu, your professional and friendly AI assistant.",
        'hi-IN': "Namaste! Main Priyanshu hun, aapka professional aur friendly AI assistant."
      },
      tanmay: {
        auto: "Hey there! I'm Tanmay, your energetic AI assistant! I'm super excited to help!",
        'en-IN': "Hey there! I'm Tanmay, your energetic AI assistant! I'm super excited to help!",
        'hi-IN': "Hey! Main Tanmay hun, aapka energetic AI assistant! Main bahut excited hun!"
      },
      ekta: {
        auto: "Good day. I am Ekta, your formal and polite AI assistant.",
        'en-IN': "Good day. I am Ekta, your formal and polite AI assistant.",
        'hi-IN': "Namaskar. Main Ekta hun, aapki formal aur polite AI assistant."
      },
      priyanka: {
        auto: "Greetings. I'm Priyanka, your technical expert AI assistant.",
        'en-IN': "Greetings. I'm Priyanka, your technical expert AI assistant.",
        'hi-IN': "Namaskar. Main Priyanka hun, aapki technical expert AI assistant."
      }
    };
    
    return testMessages[personality]?.[language] || testMessages[personality]?.auto || "Hello! This is a test message.";
  };

  const handleVoiceUpload = async (file) => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('voice', selectedVoice);
      
      // Mock voice processing - replace with real endpoint
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: '[Voice Message]',
        timestamp: new Date(),
        isVoice: true
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate processing delay
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I heard your voice message! This is a mock response. In real mode, I would transcribe your audio and respond accordingly.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      toast.error('Failed to process voice message');
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
            Voice AI Assistants
          </h1>
          <p style={{ color: '#999', fontSize: '16px' }}>
            Test and configure your AI assistant with voice and text capabilities
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '20px',
          height: isMobile ? 'auto' : '70vh'
        }}>
          {/* Chat Interface */}
          <div className="glass" style={{ 
            padding: '0', 
            display: 'flex', 
            flexDirection: 'column',
            height: isMobile ? '500px' : '100%'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FontAwesomeIcon icon={faRobot} style={{ color: '#667eea' }} />
              <h3 style={{ fontSize: '18px', margin: 0 }}>Voice AI Assistant</h3>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  {message.type === 'ai' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon icon={faRobot} style={{ fontSize: '14px', color: 'white' }} />
                    </div>
                  )}
                  
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.type === 'user' 
                      ? '#667eea' 
                      : 'rgba(255,255,255,0.1)',
                    color: message.type === 'user' ? 'white' : '#e5e7eb',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    <div>{message.content}</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.7, 
                      marginTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.confidence && (
                        <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon icon={faUser} style={{ fontSize: '14px', color: '#999' }} />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FontAwesomeIcon icon={faRobot} style={{ fontSize: '14px', color: 'white' }} />
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#999'
                  }}>
                    AI is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ 
              padding: '20px', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="btn btn-primary"
                style={{ padding: '12px 16px' }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>

          {/* Assistant Settings */}
          <div className="glass" style={{ padding: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Assistant Settings</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Languages */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Languages
                </label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input"
                >
                  <option value="auto">Auto (Hindi + English)</option>
                  <option value="hi-IN">Hindi Only</option>
                  <option value="en-IN">English Only</option>
                </select>
              </div>

              {/* Voice (TTS) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Voice Assistant
                </label>
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="input"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name.charAt(0).toUpperCase() + voice.name.slice(1)} ({voice.personality})
                    </option>
                  ))}
                </select>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  {voices.find(v => v.name === selectedVoice)?.description}
                </div>
              </div>

              {/* AI Model */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  AI Model (LLM)
                </label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="input"
                >
                  <option value="gpt-4-mini">GPT-4.1-Mini</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3">Claude-3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>

              {/* Transcription (STT) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Transcription (STT)
                </label>
                <select 
                  value={selectedSTT}
                  onChange={(e) => setSelectedSTT(e.target.value)}
                  className="input"
                >
                  <option value="azure">Azure</option>
                  <option value="google">Google</option>
                  <option value="aws">AWS Transcribe</option>
                  <option value="whisper">OpenAI Whisper</option>
                </select>
              </div>

              {/* Test Voice Button */}
              <button 
                className="btn btn-secondary"
                onClick={handleTestVoice}
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPlay} style={{ marginRight: '8px' }} />
                {isLoading ? 'Testing...' : 'Preview Voice'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call Dialog */}
      {showCallDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            borderRadius: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '20px', margin: 0 }}>
                <FontAwesomeIcon icon={faPhone} style={{ marginRight: '10px', color: '#667eea' }} />
                Make Voice Call
              </h3>
              <button
                onClick={() => setShowCallDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Message to deliver:
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#e5e7eb'
              }}>
                {callData.message}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Receiver Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter receiver's name"
                  value={callData.receiverName}
                  onChange={(e) => setCallData({ ...callData, receiverName: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91123456789"
                  value={callData.phoneNumber}
                  onChange={(e) => setCallData({ ...callData, phoneNumber: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  value={callData.companyName}
                  onChange={(e) => setCallData({ ...callData, companyName: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Escalation Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+919876543210 (for human agent transfer)"
                  value={callData.escalationNumber}
                  onChange={(e) => setCallData({ ...callData, escalationNumber: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#999', fontSize: '12px' }}>
                  Enter with country code (+91 for India) or just the 10-digit number
                </small>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '25px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCallDialog(false)}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleMakeCall}
                className="btn btn-primary"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />
                {isLoading ? 'Making Call...' : 'Make Call'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VoiceAIAssistants;