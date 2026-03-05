"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Admin routes
router.get('/', auth_middleware_1.requireAdmin, coupon_controller_1.couponController.getAll);
router.post('/', auth_middleware_1.requireAdmin, coupon_controller_1.couponController.create);
router.put('/:id', auth_middleware_1.requireAdmin, coupon_controller_1.couponController.update);
router.delete('/:id', auth_middleware_1.requireAdmin, coupon_controller_1.couponController.delete);
// Public routes
router.post('/validate', auth_middleware_1.optionalAuth, coupon_controller_1.couponController.validate);
exports.default = router;
