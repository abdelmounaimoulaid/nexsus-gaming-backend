"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.requireAuth, user_controller_1.UserController.getUsers);
router.post('/', auth_middleware_1.requireAuth, user_controller_1.UserController.createUser);
router.patch('/:id', auth_middleware_1.requireAuth, user_controller_1.UserController.updateUser);
router.delete('/:id', auth_middleware_1.requireAuth, user_controller_1.UserController.deleteUser);
exports.default = router;
