"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("../services/role.service");
class RoleController {
    static async getRoles(req, res) {
        try {
            const roles = await role_service_1.RoleService.getRoles();
            res.json(roles);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async getRoleById(req, res) {
        try {
            const role = await role_service_1.RoleService.getRoleById(req.params.id);
            if (!role)
                return res.status(404).json({ message: 'Role not found' });
            res.json(role);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async createRole(req, res) {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ message: 'name is required' });
            const exists = await role_service_1.RoleService.getRoleByName(name);
            if (exists)
                return res.status(409).json({ message: 'Role name already exists' });
            const userId = req.user?.id;
            const role = await role_service_1.RoleService.createRole(req.body, userId);
            res.status(201).json(role);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateRole(req, res) {
        try {
            const existing = await role_service_1.RoleService.getRoleById(req.params.id);
            if (!existing)
                return res.status(404).json({ message: 'Role not found' });
            if (existing.isSystem)
                return res.status(403).json({ message: 'System roles cannot be modified.' });
            const userId = req.user?.id;
            const role = await role_service_1.RoleService.updateRole(req.params.id, req.body, userId);
            res.json(role);
        }
        catch (e) {
            if (e.code === 'P2002')
                return res.status(409).json({ message: 'Role name already exists' });
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async deleteRole(req, res) {
        try {
            const existing = await role_service_1.RoleService.getRoleById(req.params.id);
            if (!existing)
                return res.status(404).json({ message: 'Role not found' });
            if (existing.isSystem)
                return res.status(403).json({ message: 'System roles cannot be deleted.' });
            await role_service_1.RoleService.deleteRole(req.params.id);
            res.status(204).send();
        }
        catch (e) {
            if (e.code === 'P2025')
                return res.status(404).json({ message: 'Role not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.RoleController = RoleController;
