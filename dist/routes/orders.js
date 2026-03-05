"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const order_validation_1 = require("../validations/order.validation");
const router = (0, express_1.Router)();
// Public/User routes
router.post('/', auth_middleware_1.optionalAuth, (0, validate_middleware_1.validate)(order_validation_1.createOrderSchema), order_controller_1.OrderController.create);
// Admin routes
router.get('/', auth_middleware_1.requireAdmin, order_controller_1.OrderController.getAll);
router.get('/:id', auth_middleware_1.requireAdmin, order_controller_1.OrderController.getById);
router.put('/:id/status', auth_middleware_1.requireAdmin, order_controller_1.OrderController.updateStatus);
router.delete('/:id', auth_middleware_1.requireAdmin, order_controller_1.OrderController.delete);
exports.default = router;
