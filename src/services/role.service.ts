import { prisma } from '../index';

export class RoleService {
    static async getRoles() {
        return await (prisma as any).role.findMany({
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            },
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }]
        });
    }

    static async getRoleById(id: string) {
        return await (prisma as any).role.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async getRoleByName(name: string) {
        return await (prisma as any).role.findUnique({ where: { name } });
    }

    static async createRole(data: any, userId: string) {
        const { name, description, permissions, icon, color } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await (prisma as any).role.create({
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

    static async updateRole(id: string, data: any, userId: string) {
        const { name, description, permissions, icon, color } = data;
        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (permissions !== undefined) updateData.permissions = permissions;
        if (icon !== undefined) updateData.icon = icon;
        if (color !== undefined) updateData.color = color;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;
        updateData.updatedById = userExists ? userId : undefined;

        return await (prisma as any).role.update({
            where: { id },
            data: updateData,
            include: {
                _count: { select: { users: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async deleteRole(id: string) {
        await (prisma as any).user.updateMany({
            where: { roleId: id },
            data: { roleId: null, roleName: null }
        });
        return await (prisma as any).role.delete({ where: { id } });
    }
}
