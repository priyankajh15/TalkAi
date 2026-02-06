import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const hasError = touched && error;
  const Component = rows ? 'textarea' : 'input';

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '20px', position: 'relative', ...style }}>
      <Component
        type={inputType}
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
          paddingRight: isPassword ? '45px' : '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPassword(!showPassword);
          }}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '10px',
            top: 0,
            bottom: 0,
            margin: 'auto 0',
            height: '30px',
            width: '30px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'color 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
        </button>
      )}

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