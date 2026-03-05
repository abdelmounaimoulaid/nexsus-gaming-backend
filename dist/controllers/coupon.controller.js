"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponController = void 0;
const coupon_service_1 = require("../services/coupon.service");
exports.couponController = {
    getAll: async (req, res) => {
        try {
            const coupons = await coupon_service_1.CouponService.getAllCoupons();
            res.json(coupons);
        }
        catch (error) {
            res.status(500).json({ error: true, message: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const coupon = await coupon_service_1.CouponService.createCoupon(req.body);
            res.json(coupon);
        }
        catch (error) {
            res.status(500).json({ error: true, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const coupon = await coupon_service_1.CouponService.updateCoupon(req.params.id, req.body);
            res.json(coupon);
        }
        catch (error) {
            res.status(500).json({ error: true, message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            await coupon_service_1.CouponService.deleteCoupon(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ error: true, message: error.message });
        }
    },
    validate: async (req, res) => {
        try {
            const { code, amount } = req.body;
            const userId = req.user?.id;
            const coupon = await coupon_service_1.CouponService.validateCoupon(code, userId, amount);
            res.json(coupon);
        }
        catch (error) {
            res.status(400).json({ error: true, message: error.message });
        }
    }
};
