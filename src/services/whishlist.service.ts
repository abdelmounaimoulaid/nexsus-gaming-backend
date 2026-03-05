import { prisma } from '../index';

export class WhishlistService {
    static async toggleWhishlist(userId: string, productId: string) {
        const existing = await (prisma as any).favorite.findUnique({
            where: {
                userId_productId: { userId, productId }
            }
        });

        if (existing) {
            await (prisma as any).favorite.delete({
                where: {
                    userId_productId: { userId, productId }
                }
            });
            return { favorited: false };
        } else {
            await (prisma as any).favorite.create({
                data: { userId, productId }
            });
            return { favorited: true };
        }
    }

    static async getUserWhishlist(userId: string) {
        return await (prisma as any).favorite.findMany({
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

    static async syncWhishlist(userId: string, productIds: string[]) {
        const existing = await (prisma as any).favorite.findMany({
            where: { userId },
            select: { productId: true }
        });
        const existingIds = existing.map((f: { productId: string }) => f.productId);

        const toCreate = productIds.filter(id => !existingIds.includes(id));

        if (toCreate.length > 0) {
            await (prisma as any).favorite.createMany({
                data: toCreate.map(productId => ({ userId, productId })),
                skipDuplicates: true
            });
        }

        return this.getUserWhishlist(userId);
    }
}
