import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fadeIn } from '../../utils/animations';
import { toast } from '../../components/Toast';
import { validateField } from '../../utils/validation.jsx';
import { Card, Button, Input } from '../../components';
import api from '../../services/api';
import { useMutation } from '@tanstack/react-query';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const forgotPasswordMutation = useMutation({
        mutationFn: async (email) => {
            return await api.post('/auth/forgot-password', { email });
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success('Reset link sent to your email!');
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.message || 'Failed to send reset link';
            toast.error(errorMessage);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailError = validateField('email', email);
        if (emailError) {
            toast.error(emailError);
            return;
        }

        forgotPasswordMutation.mutate(email);
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center', ...fadeIn }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Check your email</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
                        We've sent a password reset link to <strong>{email}</strong>.
                    </p>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button style={{ width: '100%' }}>Back to Login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center', ...fadeIn }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Reset Password</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        style={{ marginBottom: '30px' }}
                    />

                    <Button
                        type="submit"
                        style={{ width: '100%', marginBottom: '20px' }}
                        disabled={forgotPasswordMutation.isPending}
                        loading={forgotPasswordMutation.isPending}
                    >
                        Send Reset Link
                    </Button>
                </form>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Remember your password? <Link to="/login" style={{ color: '#667eea' }}>Sign in</Link>
                </p>
            </Card>
        </div>
    );
};

export default ForgotPassword;
