"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const index_1 = require("../index");
class CouponService {
    static async validateCoupon(code, userId, orderAmount = 0) {
        const coupon = await index_1.prisma.coupon.findUnique({
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
            const usage = await index_1.prisma.couponUsage.findFirst({
                where: { couponId: coupon.id, userId }
            });
            if (usage) {
                throw new Error('Vous avez déjà utilisé ce coupon.');
            }
        }
        return coupon;
    }
    static async applyCoupon(code, userId, orderAmount) {
        const coupon = await this.validateCoupon(code, userId, orderAmount);
        // This would typically be called when an order is actually placed
        // But we provide it for the controller to use during the checkout process
        return await index_1.prisma.$transaction(async (tx) => {
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
        return await index_1.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    static async createCoupon(data) {
        return await index_1.prisma.coupon.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });
    }
    static async updateCoupon(id, data) {
        return await index_1.prisma.coupon.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            }
        });
    }
    static async deleteCoupon(id) {
        return await index_1.prisma.coupon.delete({
            where: { id }
        });
    }
}
exports.CouponService = CouponService;
