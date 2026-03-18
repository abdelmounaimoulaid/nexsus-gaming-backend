"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const result = await auth_service_1.AuthService.login(email, password);
            return res.json(result);
        }
        catch (error) {
            if (error.message === 'Invalid credentials' || error.message.includes('Access denied')) {
                return res.status(401).json({ message: error.message });
            }
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async register(req, res) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            return res.json(result);
        }
        catch (error) {
            console.error('Registration error:', error);
            return res.status(400).json({ message: error.message });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            const result = await auth_service_1.AuthService.requestPasswordReset(email);
            return res.json(result);
        }
        catch (error) {
            console.error('Forgot password error:', error);
            return res.status(400).json({ message: error.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }
            const result = await auth_service_1.AuthService.resetPassword(token, newPassword);
            return res.json(result);
        }
        catch (error) {
            console.error('Reset password error:', error);
            return res.status(400).json({ message: error.message });
        }
    }
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current and new passwords are required' });
            }
            const result = await auth_service_1.AuthService.changePassword(userId, currentPassword, newPassword);
            return res.json(result);
        }
        catch (error) {
            if (error.message === 'Incorrect current password') {
                return res.status(401).json({ message: error.message });
            }
            console.error('Change password error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }
            const result = await auth_service_1.AuthService.refreshToken(refreshToken);
            return res.json(result);
        }
        catch (error) {
            return res.status(401).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
