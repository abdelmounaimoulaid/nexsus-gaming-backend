import { prisma } from '../index';

export class AddressService {
    static async getAddressesByUserId(userId: string) {
        return await (prisma as any).address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getAddressById(id: string) {
        return await (prisma as any).address.findUnique({
            where: { id }
        });
    }

    static async createAddress(userId: string, data: any) {
        const { isDefault, ...addressData } = data;

        // If this is marked as default, unset other defaults
        if (isDefault) {
            await (prisma as any).address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        return await (prisma as any).address.create({
            data: {
                ...addressData,
                userId,
                isDefault: !!isDefault
            }
        });
    }

    static async updateAddress(id: string, userId: string, data: any) {
        const { isDefault, ...addressData } = data;

        if (isDefault) {
            await (prisma as any).address.updateMany({
                where: { userId, isDefault: true, NOT: { id } },
                data: { isDefault: false }
            });
        }

        return await (prisma as any).address.update({
            where: { id },
            data: {
                ...addressData,
                isDefault: !!isDefault
            }
        });
    }

    static async deleteAddress(id: string) {
        return await (prisma as any).address.delete({
            where: { id }
        });
    }

    static async setDefaultAddress(id: string, userId: string) {
        // Unset all defaults for this user
        await (prisma as any).address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });

        // Set this one as default
        return await (prisma as any).address.update({
            where: { id },
            data: { isDefault: true }
        });
    }
}
