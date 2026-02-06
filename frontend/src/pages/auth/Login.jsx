import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { fadeIn } from '../../utils/animations';
import { toast } from '../../components/Toast';
import { validateField } from '../../utils/validation.jsx';
import { Card, Button, Input } from '../../components';
import { useMutation } from '@tanstack/react-query';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loadingMessage, setLoadingMessage] = useState('Signing in...');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle slow server message
  useEffect(() => {
    let timer;
    if (touched.submitting) {
      timer = setTimeout(() => {
        setLoadingMessage('Waking up server, please wait...');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [touched.submitting]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      return await login(email, password);
    },
    onSuccess: () => {
      toast.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
    }
  });

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

    // Validate fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true, submitting: true });

    if (emailError || passwordError) {
      toast.error('Please fix the errors below');
      return;
    }

    loginMutation.mutate({ email, password });
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
          {loginMutation.isError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#ef4444'
            }}>
              {loginMutation.error.response?.data?.message || 'Login failed'}
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

          <div style={{ position: 'relative' }}>
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
            />
            <div style={{
              textAlign: 'right',
              marginTop: '-15px',
              marginBottom: '20px'
            }}>
              <Link to="/forgot-password" style={{
                color: '#667eea',
                fontSize: '12px',
                textDecoration: 'none'
              }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loginMutation.isPending}
            loading={loginMutation.isPending}
          >
            {loginMutation.isPending ? loadingMessage : 'Sign In'}
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