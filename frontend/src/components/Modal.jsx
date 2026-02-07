import { Card } from './Card';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = '500px',
  showCloseButton = true 
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
      <Card
        style={{
          maxWidth,
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          margin: '20px',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(18px, 4vw, 24px)', 
              margin: 0,
              fontWeight: '600'
            }}>
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </Card>
    </div>
  );
};