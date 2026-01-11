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
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        border: `1px solid ${colors[toast.type]}30`,
        borderLeft: `4px solid ${colors[toast.type]}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <FontAwesomeIcon 
        icon={icons[toast.type]} 
        style={{ color: colors[toast.type], fontSize: '16px' }}
      />
      <span style={{ flex: 1, fontSize: '14px' }}>{toast.message}</span>
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
      setToasts(prev => [...prev, { id, type, message }]);
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