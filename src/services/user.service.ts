import bcrypt from 'bcryptjs';
import { prisma } from '../index';

export class UserService {
    static async getUsers(query: any) {
        const { search, roleId } = query;
        const where: any = { roleId: { not: null } };

        if (roleId) {
            where.roleId = roleId;
        }
        if (search) {
            where.email = { contains: String(search) };
        }

        return await (prisma as any).user.findMany({
            where,
            select: {
                id: true, email: true, systemRole: true, roleName: true, createdAt: true, updatedAt: true,
                role: { select: { id: true, name: true, isSystem: true, icon: true, color: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async createUser(data: any, authorId: string) {
        const { email, password, systemRole, roleId } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        let roleName = null;
        if (roleId) {
            const role = await (prisma as any).role.findUnique({ where: { id: roleId } });
            roleName = role?.name || null;
        }

        // Verify author exists before setting audit fields
        const authorExists = authorId ? await (prisma as any).user.findUnique({ where: { id: authorId } }) : null;

        return await (prisma as any).user.create({
            data: {
                email, password: hashedPassword, systemRole: systemRole || 'ADMIN',
                roleId: roleId || null,
                roleName,
                createdById: authorExists ? authorId : undefined,
                updatedById: authorExists ? authorId : undefined
            },
            select: {
                id: true, email: true, systemRole: true, roleName: true, createdAt: true, updatedAt: true,
                role: { select: { id: true, name: true, isSystem: true, icon: true, color: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async updateUser(id: string, data: any, authorId: string) {
        const { systemRole, password, roleId } = data;
        const updateData: any = {};

        if (systemRole) updateData.systemRole = systemRole;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (roleId !== undefined) {
            updateData.roleId = roleId || null;
            if (roleId) {
                const role = await (prisma as any).role.findUnique({ where: { id: roleId } });
                updateData.roleName = role?.name || null;
            } else {
                updateData.roleName = null;
            }
        }
        // Verify author exists before setting audit fields
        const authorExists = authorId ? await (prisma as any).user.findUnique({ where: { id: authorId } }) : null;
        updateData.updatedById = authorExists ? authorId : undefined;

        return await (prisma as any).user.update({
            where: { id },
            data: updateData,
            select: {
                id: true, email: true, systemRole: true, roleName: true, createdAt: true, updatedAt: true,
                role: { select: { id: true, name: true, isSystem: true, icon: true, color: true } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async deleteUser(id: string) {
        return await prisma.user.delete({ where: { id } });
    }

    static async getUserById(id: string) {
        return await (prisma as any).user.findUnique({
            where: { id },
            include: { role: true }
        });
    }

    static async checkEmailExists(email: string) {
        return await prisma.user.findUnique({ where: { email } });
    }
}
