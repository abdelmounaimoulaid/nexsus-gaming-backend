"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
class UserService {
    static async getUsers(query) {
        const { search, roleId } = query;
        const where = { roleId: { not: null } };
        if (roleId) {
            where.roleId = roleId;
        }
        if (search) {
            where.email = { contains: String(search) };
        }
        return await index_1.prisma.user.findMany({
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
    static async createUser(data, authorId) {
        const { email, password, systemRole, roleId } = data;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let roleName = null;
        if (roleId) {
            const role = await index_1.prisma.role.findUnique({ where: { id: roleId } });
            roleName = role?.name || null;
        }
        // Verify author exists before setting audit fields
        const authorExists = authorId ? await index_1.prisma.user.findUnique({ where: { id: authorId } }) : null;
        return await index_1.prisma.user.create({
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
    static async updateUser(id, data, authorId) {
        const { systemRole, password, roleId } = data;
        const updateData = {};
        if (systemRole)
            updateData.systemRole = systemRole;
        if (password)
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        if (roleId !== undefined) {
            updateData.roleId = roleId || null;
            if (roleId) {
                const role = await index_1.prisma.role.findUnique({ where: { id: roleId } });
                updateData.roleName = role?.name || null;
            }
            else {
                updateData.roleName = null;
            }
        }
        // Verify author exists before setting audit fields
        const authorExists = authorId ? await index_1.prisma.user.findUnique({ where: { id: authorId } }) : null;
        updateData.updatedById = authorExists ? authorId : undefined;
        return await index_1.prisma.user.update({
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
    static async deleteUser(id) {
        return await index_1.prisma.user.delete({ where: { id } });
    }
    static async getUserById(id) {
        return await index_1.prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });
    }
    static async checkEmailExists(email) {
        return await index_1.prisma.user.findUnique({ where: { email } });
    }
}
exports.UserService = UserService;
