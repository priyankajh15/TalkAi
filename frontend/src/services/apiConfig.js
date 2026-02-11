// API Configuration with Auto-Fallback
const API_ENDPOINTS = {
  primary: {
    node: 'https://talkai-node-backend.fly.dev',
    ai: 'https://talkai-ai-backend.fly.dev'
  },
  backup: {
    node: 'https://talkai-appo.onrender.com',
    ai: 'https://talkai-ai-backend.onrender.com'
  },
  local: {
    node: 'http://localhost:5000',
    ai: 'http://localhost:8000'
  }
};

// Track which endpoint is currently working
let currentEndpoint = 'primary';
let failureCount = 0;
const MAX_FAILURES = 2;

export const getBaseURL = () => {
  if (process.env.NODE_ENV !== 'production') {
    return API_ENDPOINTS.local.node;
  }
  
  return currentEndpoint === 'primary' 
    ? API_ENDPOINTS.primary.node 
    : API_ENDPOINTS.backup.node;
};

export const switchToBackup = () => {
  console.warn('🔄 Switching to backup server (Render)...');
  currentEndpoint = 'backup';
  failureCount = 0;
};

export const switchToPrimary = () => {
  console.log('✅ Switching back to primary server (Fly.io)...');
  currentEndpoint = 'primary';
  failureCount = 0;
};

export const handleRequestFailure = () => {
  failureCount++;
  
  if (failureCount >= MAX_FAILURES && currentEndpoint === 'primary') {
    switchToBackup();
    return true; // Switched
  }
  
  return false; // Not switched
};

export const resetFailureCount = () => {
  failureCount = 0;
};

export const getCurrentEndpoint = () => currentEndpoint;
