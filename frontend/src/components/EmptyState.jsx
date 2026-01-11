import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { buttonPress } from '../utils/animations';

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  iconColor = '#667eea'
}) => (
  <div style={{
    textAlign: 'center',
    padding: 'clamp(40px, 8vh, 100px) 20px',
    maxWidth: '500px',
    margin: '0 auto'
  }}>
    <div style={{
      width: 'clamp(100px, 15vw, 120px)',
      height: 'clamp(100px, 15vw, 120px)',
      margin: '0 auto 30px',
      background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}08 100%)`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s ease-in-out infinite'
    }}>
      <FontAwesomeIcon 
        icon={icon} 
        style={{ 
          fontSize: 'clamp(36px, 6vw, 48px)', 
          color: iconColor 
        }} 
      />
    </div>
    
    <h3 style={{ 
      fontSize: 'clamp(20px, 4vw, 24px)', 
      marginBottom: '12px',
      fontWeight: '600'
    }}>
      {title}
    </h3>
    <p style={{ 
      color: '#999', 
      marginBottom: '30px', 
      lineHeight: '1.6',
      fontSize: 'clamp(14px, 3vw, 16px)'
    }}>
      {description}
    </p>
    {actionText && onAction && (
      <button 
        className="btn btn-primary" 
        onClick={onAction}
        {...buttonPress}
      >
        {actionText}
      </button>
    )}
  </div>
);