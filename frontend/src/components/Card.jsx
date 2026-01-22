export const Card = ({
  children,
  hover = false,
  onClick,
  className = '',
  style = {},
  padding = 'clamp(20px, 4vw, 30px)'
}) => (
  <div
    className={`glass ${className}`}
    onClick={onClick}
    style={{
      padding,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      ...style
    }}
    onMouseEnter={(e) => hover && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={(e) => hover && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    {children}
  </div>
);