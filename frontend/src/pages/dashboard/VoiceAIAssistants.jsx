import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faRobot, faUser, faPlay, faPause, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { toast } from '../../components/Toast';
import { aiAPI } from '../../services/api';

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
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('ekta');
  const [selectedModel, setSelectedModel] = useState('gpt-4-mini');
  const [selectedSTT, setSelectedSTT] = useState('azure');
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Get available voices
  const { data: voicesData } = useQuery({
    queryKey: ['ai-voices'],
    queryFn: async () => {
      const response = await aiAPI.getVoices();
      return response.data;
    }
  });

  const voices = voicesData?.voices || [
    { name: 'ekta', gender: 'female', language: 'en-IN' },
    { name: 'priyanka', gender: 'female', language: 'en-IN' },
    { name: 'anuj', gender: 'male', language: 'en-IN' },
    { name: 'priyanshu', gender: 'male', language: 'en-IN' }
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

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat(inputMessage, {
        voice: selectedVoice,
        language: selectedLanguage,
        model: selectedModel,
        stt_provider: selectedSTT
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.data.ai_response,
        timestamp: new Date(),
        confidence: response.data.data.confidence
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
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
              <h3 style={{ fontSize: '18px', margin: 0 }}>AI Chat Interface</h3>
              <span style={{ 
                marginLeft: 'auto',
                fontSize: '12px',
                color: '#999',
                padding: '4px 8px',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderRadius: '12px'
              }}>
                Mock Mode
              </span>
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
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleVoiceUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="voice-upload"
                  />
                  <button
                    onClick={() => document.getElementById('voice-upload').click()}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} />
                    Voice
                  </button>
                </div>
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
                  <option value="">No languages selected</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>

              {/* Voice (TTS) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Voice (TTS)
                </label>
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="input"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
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
                onClick={() => toast.info('Voice test feature coming soon!')}
                style={{ width: '100%' }}
              >
                <FontAwesomeIcon icon={faPlay} style={{ marginRight: '8px' }} />
                Test Voice
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoiceAIAssistants;