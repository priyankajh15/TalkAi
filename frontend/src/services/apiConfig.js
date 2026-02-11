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

// Auto-detect based on hostname
const getInitialEndpoint = () => {
  if (typeof window === 'undefined') return 'backup';
  
  const hostname = window.location.hostname;
  
  // If deployed on Vercel with Fly.io backends ready
  if (hostname.includes('vercel.app') && import.meta.env.VITE_USE_FLY === 'true') {
    return 'primary';
  }
  
  // Default to Render (backup)
  return 'backup';
};

// Track which endpoint is currently working
let currentEndpoint = getInitialEndpoint();
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
  currentEndpoint = 'backup';
  failureCount = 0;
};

export const switchToPrimary = () => {
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
