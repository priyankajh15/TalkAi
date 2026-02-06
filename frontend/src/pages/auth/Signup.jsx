import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { fadeIn } from '../../utils/animations';
import { toast } from '../../components/Toast';
import { validateField } from '../../utils/validation.jsx';
import { Card, Button, Input } from '../../components';
import { useMutation } from '@tanstack/react-query';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loadingMessage, setLoadingMessage] = useState('Creating account...');

  const { signup } = useAuth();
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

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      return await signup(data.email, data.password, data.companyName, data.name);
    },
    onSuccess: () => {
      toast.success('Account created successfully! Welcome to TalkAi!');
      navigate('/dashboard');
    },
    onError: (err) => {
      let errorMessage;
      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.message).join(', ');
      } else {
        errorMessage = err.response?.data?.message || 'Signup failed';
      }
      toast.error(errorMessage);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, companyName: true, submitting: true });

    if (Object.values(newErrors).some(error => error)) {
      toast.error('Please fix the errors below');
      return;
    }

    signupMutation.mutate(formData);
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
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>TalkAi</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px, 3vw, 16px)' }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {signupMutation.isError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#ef4444'
            }}>
              {signupMutation.error.response?.data?.message || 'Signup failed'}
            </div>
          )}

          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            placeholder="Full Name"
            required
          />

          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            placeholder="Email Address"
            required
          />

          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            placeholder="Password (8+ characters)"
            required
          />

          <Input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.companyName}
            touched={touched.companyName}
            placeholder="Company Name"
            required
          />

          <Button
            type="submit"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={signupMutation.isPending}
            loading={signupMutation.isPending}
          >
            {signupMutation.isPending ? loadingMessage : 'Sign Up'}
          </Button>
        </form>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea' }}>Sign in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;