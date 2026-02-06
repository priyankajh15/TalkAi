const { Resend } = require('resend');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const CompanyUser = require('../models/CompanyUser.model');
const logger = require('../config/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * FORGOT PASSWORD - Send reset email
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await CompanyUser.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            return res.json({
                success: true,
                message: 'If that email exists, a reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before saving to database
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save hashed token and expiry (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send email via Resend
        try {
            await resend.emails.send({
                from: process.env.EMAIL_FROM || 'TalkAi <onboarding@resend.dev>',
                to: user.email,
                subject: 'Password Reset Request',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Reset Your Password</h2>
            <p>You requested to reset your password for your TalkAi account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
            });

            logger.info('Password reset email sent', {
                requestId: req.id,
                email: user.email
            });

            return res.json({
                success: true,
                message: 'If that email exists, a reset link has been sent.'
            });

        } catch (emailError) {
            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            logger.error('Failed to send reset email', {
                requestId: req.id,
                error: emailError.message,
                email: user.email
            });

            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email. Please try again later.',
                requestId: req.id
            });
        }

    } catch (err) {
        logger.error('Forgot password error', {
            requestId: req.id,
            error: err.message,
            stack: err.stack
        });

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
            requestId: req.id
        });
    }
};

/**
 * RESET PASSWORD - Verify token and update password
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token from URL to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token that hasn't expired
        const user = await CompanyUser.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        logger.info('Password reset successful', {
            requestId: req.id,
            userId: user._id
        });

        return res.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (err) {
        logger.error('Reset password error', {
            requestId: req.id,
            error: err.message,
            stack: err.stack
        });

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
            requestId: req.id
        });
    }
};
