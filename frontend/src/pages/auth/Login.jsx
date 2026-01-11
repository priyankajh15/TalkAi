import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { fadeIn } from '../../utils/animations';
import { toast } from '../../components/Toast';
import { validateField } from '../../utils/validation.jsx';
import { Card, Button, Input } from '../../components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateField('email', e.target.value) }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validateField('password', e.target.value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    
    if (emailError || passwordError) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 4vw, 20px)'
    }}>
      <Card style={{
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        ...fadeIn
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>TalkAi</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#ef4444'
            }}>
              {error}
            </div>
          )}
          
          <Input
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            placeholder="Email Address"
            required
          />

          <Input
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            placeholder="Password"
            required
            style={{ marginBottom: '30px' }}
          />

          <Button 
            type="submit" 
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#667eea' }}>Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;