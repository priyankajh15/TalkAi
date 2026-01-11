export const Input = ({ 
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  disabled = false,
  rows,
  style = {},
  ...props
}) => {
  const hasError = touched && error;
  const Component = rows ? 'textarea' : 'input';
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <Component
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="input"
        rows={rows}
        required={required}
        disabled={disabled}
        style={{
          borderColor: hasError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style
        }}
        {...props}
      />
      {hasError && (
        <div style={{ 
          color: '#ef4444', 
          fontSize: '12px', 
          marginTop: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};