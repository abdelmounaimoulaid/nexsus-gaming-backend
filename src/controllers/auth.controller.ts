import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const result = await AuthService.login(email, password);
            return res.json(result);
        } catch (error: any) {
            if (error.message === 'Invalid credentials' || error.message.includes('Access denied')) {
                return res.status(401).json({ message: error.message });
            }
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = (req as any).user?.id;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current and new passwords are required' });
            }

            const result = await AuthService.changePassword(userId, currentPassword, newPassword);
            return res.json(result);
        } catch (error: any) {
            if (error.message === 'Incorrect current password') {
                return res.status(401).json({ message: error.message });
            }
            console.error('Change password error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
