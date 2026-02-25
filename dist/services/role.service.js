"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const index_1 = require("../index");
class RoleService {
    static async getRoles() {
        return await index_1.prisma.role.findMany({
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            },
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }]
        });
    }
    static async getRoleById(id) {
        return await index_1.prisma.role.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }
    static async getRoleByName(name) {
        return await index_1.prisma.role.findUnique({ where: { name } });
    }
    static async createRole(data, userId) {
        const { name, description, permissions, icon, color } = data;
        // Verify user exists before setting audit fields
        const userExists = userId ? await index_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        return await index_1.prisma.role.create({
            data: {
                name,
                description: description || null,
                permissions: permissions || [],
                icon: icon || 'Shield',
                color: color || '#E05727',
                createdById: userExists ? userId : undefined,
                updatedById: userExists ? userId : undefined
            },
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }
    static async updateRole(id, data, userId) {
        const { name, description, permissions, icon, color } = data;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (permissions !== undefined)
            updateData.permissions = permissions;
        if (icon !== undefined)
            updateData.icon = icon;
        if (color !== undefined)
            updateData.color = color;
        // Verify user exists before setting audit fields
        const userExists = userId ? await index_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        updateData.updatedById = userExists ? userId : undefined;
        return await index_1.prisma.role.update({
            where: { id },
            data: updateData,
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }
    static async deleteRole(id) {
        await index_1.prisma.user.updateMany({
            where: { roleId: id },
            data: { roleId: null, roleName: null }
        });
        return await index_1.prisma.role.delete({ where: { id } });
    }
}
exports.RoleService = RoleService;
