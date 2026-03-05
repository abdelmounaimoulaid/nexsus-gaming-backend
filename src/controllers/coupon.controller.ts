import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';

export const couponController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const coupons = await CouponService.getAllCoupons();
            res.json(coupons);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const coupon = await CouponService.createCoupon(req.body);
            res.json(coupon);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const coupon = await CouponService.updateCoupon(req.params.id as string, req.body);
            res.json(coupon);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            await CouponService.deleteCoupon(req.params.id as string);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    },

    validate: async (req: Request, res: Response) => {
        try {
            const { code, amount } = req.body;
            const userId = (req as any).user?.id;
            const coupon = await CouponService.validateCoupon(code, userId, amount);
            res.json(coupon);
        } catch (error: any) {
            res.status(400).json({ error: true, message: error.message });
        }
    }
};
