"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/login', auth_controller_1.AuthController.login);
router.post('/register', auth_controller_1.AuthController.register);
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
router.put('/change-password', auth_middleware_1.requireAuth, auth_controller_1.AuthController.changePassword);
router.post('/refresh', auth_controller_1.AuthController.refreshToken);
exports.default = router;
