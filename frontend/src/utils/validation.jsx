export const validateField = (name, value) => {
  switch(name) {
    case 'email':
      if (!value) return 'Email is required';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
        ? '' 
        : 'Please enter a valid email address';
    
    case 'password':
      if (!value) return 'Password is required';
      return value.length >= 8 
        ? '' 
        : 'Password must be at least 8 characters';
    
    case 'name':
      if (!value) return 'Name is required';
      return value.trim().length >= 2 
        ? '' 
        : 'Name must be at least 2 characters';
    
    case 'companyName':
      if (!value) return 'Company name is required';
      return value.trim().length >= 2 
        ? '' 
        : 'Company name must be at least 2 characters';
    
    case 'title':
      if (!value) return 'Title is required';
      return value.trim().length >= 3 
        ? '' 
        : 'Title must be at least 3 characters';
    
    case 'content':
      if (!value) return 'Content is required';
      return value.trim().length >= 10 
        ? '' 
        : 'Content must be at least 10 characters';
    
    default:
      return '';
  }
};

export const FormField = ({ 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  placeholder,
  required = false,
  rows,
  style = {}
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
        style={{
          borderColor: hasError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
          ...style
        }}
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