"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const index_1 = require("../index");
class AddressService {
    static async getAddressesByUserId(userId) {
        return await index_1.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async getAddressById(id) {
        return await index_1.prisma.address.findUnique({
            where: { id }
        });
    }
    static async createAddress(userId, data) {
        const { isDefault, ...addressData } = data;
        // If this is marked as default, unset other defaults
        if (isDefault) {
            await index_1.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }
        return await index_1.prisma.address.create({
            data: {
                ...addressData,
                userId,
                isDefault: !!isDefault
            }
        });
    }
    static async updateAddress(id, userId, data) {
        const { isDefault, ...addressData } = data;
        if (isDefault) {
            await index_1.prisma.address.updateMany({
                where: { userId, isDefault: true, NOT: { id } },
                data: { isDefault: false }
            });
        }
        return await index_1.prisma.address.update({
            where: { id },
            data: {
                ...addressData,
                isDefault: !!isDefault
            }
        });
    }
    static async deleteAddress(id) {
        return await index_1.prisma.address.delete({
            where: { id }
        });
    }
    static async setDefaultAddress(id, userId) {
        // Unset all defaults for this user
        await index_1.prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });
        // Set this one as default
        return await index_1.prisma.address.update({
            where: { id },
            data: { isDefault: true }
        });
    }
}
exports.AddressService = AddressService;
