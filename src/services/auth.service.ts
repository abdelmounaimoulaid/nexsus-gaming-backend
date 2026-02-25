import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export class AuthService {

    static async login(email: string, password: string) {
        const user = await (prisma as any).user.findUnique({
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const roleData = user.role ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
            isSystem: user.role.isSystem
        } : null;

        const token = jwt.sign({
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

    static async changePassword(userId: string, currentPass: string, newPass: string) {
        const user = await (prisma as any).user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(currentPass, user.password);
        if (!isMatch) {
            throw new Error('Incorrect current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPass, 10);
        await (prisma as any).user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        return { success: true, message: 'Password updated successfully' };
    }
}
