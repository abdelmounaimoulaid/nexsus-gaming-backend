import { prisma } from '../index';

export class CouponService {
    static async validateCoupon(code: string, userId?: string, orderAmount: number = 0) {
        const coupon = await (prisma as any).coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            throw new Error('Coupon invalide.');
        }

        if (!coupon.isActive) {
            throw new Error('Ce coupon n\'est plus actif.');
        }

        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) {
            throw new Error('Ce coupon n\'est pas encore valide.');
        }
        if (coupon.endDate && now > coupon.endDate) {
            throw new Error('Ce coupon a expiré.');
        }

        if (orderAmount < coupon.minOrderAmount) {
            throw new Error(`Le montant minimum pour ce coupon est de ${coupon.minOrderAmount} DH.`);
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Ce coupon a atteint sa limite d\'utilisation.');
        }

        if (userId) {
            const usage = await (prisma as any).couponUsage.findFirst({
                where: { couponId: coupon.id, userId }
            });
            if (usage) {
                throw new Error('Vous avez déjà utilisé ce coupon.');
            }
        }

        return coupon;
    }

    static async applyCoupon(code: string, userId: string, orderAmount: number) {
        const coupon = await this.validateCoupon(code, userId, orderAmount);

        // This would typically be called when an order is actually placed
        // But we provide it for the controller to use during the checkout process
        return await (prisma as any).$transaction(async (tx: any) => {
            await tx.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
            });

            await tx.couponUsage.create({
                data: {
                    couponId: coupon.id,
                    userId
                }
            });

            return coupon;
        });
    }

    static async getAllCoupons() {
        return await (prisma as any).coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    static async createCoupon(data: any) {
        return await (prisma as any).coupon.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });
    }

    static async updateCoupon(id: string, data: any) {
        return await (prisma as any).coupon.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            }
        });
    }

    static async deleteCoupon(id: string) {
        return await (prisma as any).coupon.delete({
            where: { id }
        });
    }
}
