import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fadeIn } from '../../utils/animations';
import { toast } from '../../components/Toast';
import { validateField } from '../../utils/validation.jsx';
import { Card, Button, Input } from '../../components';
import api from '../../services/api';
import { useMutation } from '@tanstack/react-query';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ token, password }) => {
            return await api.post(`/auth/reset-password/${token}`, { password });
        },
        onSuccess: () => {
            toast.success('Password reset successful! Please login with your new password.');
            setTimeout(() => navigate('/login'), 2000);
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.message || 'Failed to reset password';
            toast.error(errorMessage);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password
        const passwordError = validateField('password', password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        resetPasswordMutation.mutate({ token, password });
    };

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
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Set New Password</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password (8+ characters)"
                        required
                    />

                    <Input
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        required
                        style={{ marginBottom: '30px' }}
                    />

                    <Button
                        type="submit"
                        style={{ width: '100%', marginBottom: '20px' }}
                        disabled={resetPasswordMutation.isPending}
                        loading={resetPasswordMutation.isPending}
                    >
                        Reset Password
                    </Button>
                </form>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Remember your password? <Link to="/login" style={{ color: '#667eea' }}>Sign in</Link>
                </p>
            </Card>
        </div>
    );
};

export default ResetPassword;
