import { buttonPress } from '../utils/animations';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  onClick,
  style = {},
  ...props 
}) => {
  const sizes = {
    small: { padding: '8px 16px', fontSize: '12px' },
    medium: { padding: '12px 24px', fontSize: '14px' },
    large: { padding: '16px 32px', fontSize: '16px' }
  };
  
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ 
        ...sizes[size],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...buttonPress}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};