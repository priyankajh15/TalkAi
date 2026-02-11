import axios from 'axios';
import { getBaseURL, handleRequestFailure, resetFailureCount, switchToBackup, getCurrentEndpoint } from './apiConfig';

// Request cache for deduplication
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

const api = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 second timeout
});

// Request deduplication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Generate cache key from method, URL, and params
  const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  
  // Check if identical request is in flight
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    if (age < CACHE_DURATION && cached.promise) {
      // Return existing promise to deduplicate request
      return cached.promise.then(() => config);
    } else {
      // Clear expired cache
      requestCache.delete(cacheKey);
    }
  }
  
  // Store new request in cache
  const promise = new Promise((resolve) => {
    config._cacheResolve = resolve;
  });
  
  requestCache.set(cacheKey, {
    promise,
    timestamp: Date.now()
  });
  
  return config;
});

// Response interceptor with cache cleanup and auto-fallback
api.interceptors.response.use(
  (response) => {
    // Resolve cache promise
    if (response.config._cacheResolve) {
      response.config._cacheResolve();
    }
    
    // Reset failure count on success
    resetFailureCount();
    
    // Clean up cache entry after response
    const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params || {})}`;
    setTimeout(() => requestCache.delete(cacheKey), CACHE_DURATION);
    
    return response;
  },
  async (error) => {
    // Clean up cache on error
    if (error.config) {
      const cacheKey = `${error.config.method}:${error.config.url}:${JSON.stringify(error.config.params || {})}`;
      requestCache.delete(cacheKey);
    }
    
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Auto-fallback on network errors or 5xx errors
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;
    
    if ((isNetworkError || isServerError) && !error.config._retry) {
      const switched = handleRequestFailure();
      
      if (switched) {
        // Update baseURL and retry
        error.config._retry = true;
        error.config.baseURL = `${getBaseURL()}/api/v1`;
        return api.request(error.config);
      }
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
    api.patch(`/knowledge/${fileId}/toggle-calls`, { useInCalls }),

  // Analytics functions
  getAnalytics: (days, botName) =>
    api.get('/analytics', { params: { days, botName } }),

  getLastCallTime: () =>
    api.get('/analytics/last-call')
};

// Voice API functions with auto-fallback
export const voiceAPI = {
  // Make voice call
  makeCall: async (callData) => {
    const baseURL = getBaseURL();
    const token = localStorage.getItem('token');

    try {
      return await axios.post(`${baseURL}/api/voice/make-call`, callData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000
      });
    } catch (error) {
      // Try backup if primary fails
      if (getCurrentEndpoint() === 'primary' && !error.config?._retry) {
        switchToBackup();
        
        return axios.post(`${getBaseURL()}/api/voice/make-call`, callData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000,
          _retry: true
        });
      }
      throw error;
    }
  }
};

export default api;