"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
class AuthService {
    static async login(email, password) {
        const user = await index_1.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Only allow login if user has an assigned role
        if (!user.roleId) {
            throw new Error('Access denied: Customers cannot log in to the admin panel.');
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
            permissions: roleData?.permissions || [],
            isSystem: roleData?.isSystem || false
        }, JWT_SECRET, { expiresIn: '1d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                systemRole: user.systemRole,
                role: roleData
            }
        };
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
}
exports.AuthService = AuthService;
