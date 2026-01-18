const axios = require('axios');

class AIService {
  constructor() {
    this.aiBackendUrl = process.env.AI_BACKEND_URL || 'https://talkai-ai-backend.onrender.com';
  }

  async processTextChat(message, companyName = 'Demo Company', context = null) {
    try {
      const payload = {
        message: message,
        company_name: companyName
      };
      
      // Only add context if it has data
      if (context && Object.keys(context).length > 0) {
        payload.context = context;
      }
      
      console.log('Sending to AI backend:', payload);
      
      const response = await axios.post(`${this.aiBackendUrl}/ai/chat`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('AI Chat Error:', error.response?.data || error.message);
      throw new Error(`AI Chat Error: ${error.message}`);
    }
  }

  async processVoiceCall(audioBuffer, companyName = 'Demo Company', voice = 'ekta', context = {}) {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBuffer, 'call_audio.wav');
      formData.append('company_name', companyName);
      formData.append('voice', voice);
      formData.append('context', JSON.stringify(context));

      const response = await axios.post(`${this.aiBackendUrl}/ai/process-voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`AI Voice Processing Error: ${error.message}`);
    }
  }

  async getAvailableVoices(provider = null, gender = null) {
    try {
      const params = {};
      if (provider) params.provider = provider;
      if (gender) params.gender = gender;

      const response = await axios.get(`${this.aiBackendUrl}/ai/voices`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`AI Voices Error: ${error.message}`);
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBuffer, 'audio.wav');

      const response = await axios.post(`${this.aiBackendUrl}/ai/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`AI Transcription Error: ${error.message}`);
    }
  }

  async synthesizeSpeech(text, voice = 'ekta', speed = 1.0) {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('voice', voice);
      formData.append('speed', speed.toString());

      const response = await axios.post(`${this.aiBackendUrl}/ai/synthesize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`AI Speech Synthesis Error: ${error.message}`);
    }
  }

  async getCallRecording(callId) {
    try {
      const response = await axios.get(`${this.aiBackendUrl}/ai/recording/${callId}`);
      return response.data;
    } catch (error) {
      throw new Error(`AI Recording Error: ${error.message}`);
    }
  }
}

module.exports = new AIService();