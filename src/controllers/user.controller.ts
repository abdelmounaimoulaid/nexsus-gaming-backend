import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
    static async getUsers(req: Request, res: Response) {
        try {
            const users = await UserService.getUsers(req.query);
            res.json(users);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async createUser(req: Request, res: Response) {
        try {
            const { email, password, systemRole } = req.body;
            if (!email || !password || !systemRole) {
                return res.status(400).json({ message: 'email, password and systemRole are required' });
            }

            const exists = await UserService.checkEmailExists(email);
            if (exists) return res.status(409).json({ message: 'Email already in use' });

            const authorId = (req as any).user?.id;
            const user = await UserService.createUser(req.body, authorId);
            res.status(201).json(user);
        } catch (e) {
            console.error('Create user error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const authorId = (req as any).user?.id;
            const user = await UserService.updateUser(req.params.id as string, req.body, authorId);
            res.json(user);
        } catch (e: any) {
            if (e.code === 'P2025') return res.status(404).json({ message: 'User not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const user = await UserService.getUserById(req.params.id as string);
            if (!user) return res.status(404).json({ message: 'User not found' });
            if ((user as any).role?.isSystem) {
                return res.status(403).json({ message: 'System accounts are protected and cannot be deleted.' });
            }

            await UserService.deleteUser(req.params.id as string);
            res.status(204).send();
        } catch (e: any) {
            if (e.code === 'P2025') return res.status(404).json({ message: 'User not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
