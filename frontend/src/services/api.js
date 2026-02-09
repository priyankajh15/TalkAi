import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://talkai-appo.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AI API functions
export const aiAPI = {
  // Chat with AI
  chat: (message, context = {}) =>
    api.post('/ai/chat', { message, context }),

  // Get call logs with AI data
  getCallLogs: (page = 1, limit = 10) =>
    api.get('/ai/call-logs', { params: { page, limit } }),

  // Get available voices
  getVoices: (provider = null, gender = null) =>
    api.get('/ai/voices', { params: { provider, gender } }),

  // Get call recording
  getRecording: (callId) =>
    api.get(`/ai/recording/${callId}`),

  // Knowledge base functions
  getKnowledgeBase: () =>
    api.get('/ai/knowledge/files'),

  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/knowledge/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  addWebsite: (url) => {
    const formData = new FormData();
    formData.append('url', url);
    return api.post('/ai/knowledge/add-website', formData);
  },

  getKnowledgeFiles: () =>
    api.get('/knowledge'),

  deleteKnowledgeFile: (fileId) =>
    api.delete(`/knowledge/${fileId}`),

  toggleUseInCalls: (fileId, useInCalls) =>
    api.patch(`/knowledge/${fileId}/toggle-calls`, { useInCalls })
};

// Voice API functions
export const voiceAPI = {
  // Make voice call
  makeCall: (callData) => {
    // Force production URL for Vercel deployment
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://talkai-appo.onrender.com';

    const token = localStorage.getItem('token');
    console.log('Making call to:', baseURL);
    console.log('Token present:', !!token);

    return axios.post(`${baseURL}/api/voice/make-call`, callData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default api;