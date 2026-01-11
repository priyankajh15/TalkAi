import { buttonPress } from '../utils/animations';

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  isDestructive = false,
  isLoading = false 
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }} 
      onClick={onClose}
    >
      <div 
        className="glass" 
        style={{
          maxWidth: '400px',
          width: '90%',
          padding: 'clamp(20px, 5vw, 30px)',
          animation: 'slideUp 0.3s ease'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          marginBottom: '15px', 
          fontSize: 'clamp(18px, 4vw, 20px)',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: '#999', 
          marginBottom: '25px', 
          lineHeight: '1.5',
          fontSize: 'clamp(14px, 3vw, 16px)'
        }}>
          {message}
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            disabled={isLoading}
            {...buttonPress}
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="btn btn-primary"
            disabled={isLoading}
            style={isDestructive ? {
              background: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ef4444'
            } : {}}
            {...buttonPress}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};