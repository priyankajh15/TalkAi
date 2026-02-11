import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faInfo, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

let toastId = 0;
let addToast = null;

export const toast = {
  success: (message) => addToast?.({ type: 'success', message }),
  error: (message) => addToast?.({ type: 'error', message }),
  info: (message) => addToast?.({ type: 'info', message }),
  warning: (message) => addToast?.({ type: 'warning', message })
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: faCheck,
    error: faTimes,
    info: faInfo,
    warning: faExclamationTriangle
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.timestamp, onRemove]);

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        border: `1px solid ${colors[toast.type]}30`,
        borderLeft: `4px solid ${colors[toast.type]}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '320px',
        maxWidth: '90vw',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'slideIn 0.3s ease-out',
        wordBreak: 'break-word'
      }}
    >
      <FontAwesomeIcon 
        icon={icons[toast.type]} 
        style={{ color: colors[toast.type], fontSize: '16px' }}
      />
      <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '12px'
        }}
      >
        ✕
      </button>
    </div>
  );
};

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = ({ type, message }) => {
      const id = ++toastId;
      
      // Check if same message already exists
      setToasts(prev => {
        const existingToast = prev.find(t => t.message === message && t.type === type);
        
        if (existingToast) {
          // Update existing toast (reset timer)
          return prev.map(t => 
            t.id === existingToast.id 
              ? { ...t, id: ++toastId, timestamp: Date.now() } 
              : t
          );
        }
        
        // Add new toast
        return [...prev, { id, type, message, timestamp: Date.now() }];
      });
    };
    
    return () => {
      addToast = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};