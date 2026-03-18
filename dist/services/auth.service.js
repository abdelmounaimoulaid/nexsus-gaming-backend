"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../index");
const customer_service_1 = require("./customer.service");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
class AuthService {
    static async login(email, password) {
        const user = await index_1.prisma.user.findUnique({
            where: { email },
            include: { role: true, addresses: true }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Only allow login if user has an assigned role or is a regular customer
        if (!user.roleId && user.systemRole !== 'USER') {
            throw new Error('Access denied: Unauthorized login attempt.');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const roleData = user.role ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
            isSystem: user.role.isSystem
        } : null;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            systemRole: user.systemRole,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            permissions: roleData?.permissions || [],
            isSystem: roleData?.isSystem || false
        }, JWT_SECRET, { expiresIn: '1d' });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: user.id,
            type: 'refresh'
        }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                systemRole: user.systemRole,
                role: roleData,
                addresses: user.addresses || []
            }
        };
    }
    static async register(data) {
        const { email } = data;
        const existing = await customer_service_1.CustomerService.checkEmailExists(email);
        if (existing) {
            throw new Error('Email already registered');
        }
        // CustomerService.createCustomer handles User creation if password is provided
        const result = await customer_service_1.CustomerService.createCustomer({
            ...data,
            customerType: 'INDIVIDUAL'
        });
        // Generate token for immediate login
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            systemRole: user.systemRole,
            email: user.email,
            permissions: [],
            isSystem: false
        }, JWT_SECRET, { expiresIn: '1d' });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: user.id,
            type: 'refresh'
        }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                systemRole: user.systemRole,
                role: null,
                addresses: []
            }
        };
    }
    static async requestPasswordReset(email) {
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't leak if email exists or not for security, but for now we follow simple logic
            throw new Error('User not found');
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour
        await index_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpires: expires
            }
        });
        return { success: true, message: 'Reset token generated', token }; // Returning token for easy testing/integration without real email service
    }
    static async resetPassword(token, newPass) {
        const user = await index_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() }
            }
        });
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPass, 10);
        await index_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedNewPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });
        return { success: true, message: 'Password reset successfully' };
    }
    static async changePassword(userId, currentPass, newPass) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcryptjs_1.default.compare(currentPass, user.password);
        if (!isMatch) {
            throw new Error('Incorrect current password');
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPass, 10);
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        return { success: true, message: 'Password updated successfully' };
    }
    static async refreshToken(oldRefreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, JWT_SECRET);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            const user = await index_1.prisma.user.findUnique({
                where: { id: decoded.id },
                include: { role: true, addresses: true }
            });
            if (!user) {
                throw new Error('User not found');
            }
            const roleData = user.role ? {
                id: user.role.id,
                name: user.role.name,
                permissions: user.role.permissions,
                isSystem: user.role.isSystem
            } : null;
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                systemRole: user.systemRole,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                permissions: roleData?.permissions || [],
                isSystem: roleData?.isSystem || false
            }, JWT_SECRET, { expiresIn: '1d' });
            const refreshToken = jsonwebtoken_1.default.sign({
                id: user.id,
                type: 'refresh'
            }, JWT_SECRET, { expiresIn: '7d' });
            return {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    systemRole: user.systemRole,
                    role: roleData,
                    addresses: user.addresses || []
                }
            };
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
}
exports.AuthService = AuthService;
