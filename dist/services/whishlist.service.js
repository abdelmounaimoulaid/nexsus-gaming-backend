"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhishlistService = void 0;
const index_1 = require("../index");
class WhishlistService {
    static async toggleWhishlist(userId, productId) {
        const existing = await index_1.prisma.favorite.findUnique({
            where: {
                userId_productId: { userId, productId }
            }
        });
        if (existing) {
            await index_1.prisma.favorite.delete({
                where: {
                    userId_productId: { userId, productId }
                }
            });
            return { favorited: false };
        }
        else {
            await index_1.prisma.favorite.create({
                data: { userId, productId }
            });
            return { favorited: true };
        }
    }
    static async getUserWhishlist(userId) {
        return await index_1.prisma.favorite.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: { take: 1 },
                        category: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async syncWhishlist(userId, productIds) {
        const existing = await index_1.prisma.favorite.findMany({
            where: { userId },
            select: { productId: true }
        });
        const existingIds = existing.map((f) => f.productId);
        const toCreate = productIds.filter(id => !existingIds.includes(id));
        if (toCreate.length > 0) {
            await index_1.prisma.favorite.createMany({
                data: toCreate.map(productId => ({ userId, productId })),
                skipDuplicates: true
            });
        }
        return this.getUserWhishlist(userId);
    }
}
exports.WhishlistService = WhishlistService;
