import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
    static async getRoles(req: Request, res: Response) {
        try {
            const roles = await RoleService.getRoles();
            res.json(roles);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async getRoleById(req: Request, res: Response) {
        try {
            const role = await RoleService.getRoleById(req.params.id as string);
            if (!role) return res.status(404).json({ message: 'Role not found' });
            res.json(role);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async createRole(req: Request, res: Response) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: 'name is required' });

            const exists = await RoleService.getRoleByName(name);
            if (exists) return res.status(409).json({ message: 'Role name already exists' });

            const userId = (req as any).user?.id;
            const role = await RoleService.createRole(req.body, userId);
            res.status(201).json(role);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateRole(req: Request, res: Response) {
        try {
            const existing = await RoleService.getRoleById(req.params.id as string);
            if (!existing) return res.status(404).json({ message: 'Role not found' });
            if (existing.isSystem) return res.status(403).json({ message: 'System roles cannot be modified.' });

            const userId = (req as any).user?.id;
            const role = await RoleService.updateRole(req.params.id as string, req.body, userId);
            res.json(role);
        } catch (e: any) {
            if (e.code === 'P2002') return res.status(409).json({ message: 'Role name already exists' });
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async deleteRole(req: Request, res: Response) {
        try {
            const existing = await RoleService.getRoleById(req.params.id as string);
            if (!existing) return res.status(404).json({ message: 'Role not found' });
            if (existing.isSystem) return res.status(403).json({ message: 'System roles cannot be deleted.' });

            await RoleService.deleteRole(req.params.id as string);
            res.status(204).send();
        } catch (e: any) {
            if (e.code === 'P2025') return res.status(404).json({ message: 'Role not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
