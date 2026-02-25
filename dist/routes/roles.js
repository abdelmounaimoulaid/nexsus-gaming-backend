"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_controller_1 = require("../controllers/role.controller");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.requireAuth, role_controller_1.RoleController.getRoles);
router.get('/:id', auth_middleware_1.requireAuth, role_controller_1.RoleController.getRoleById);
router.post('/', auth_middleware_1.requireAuth, role_controller_1.RoleController.createRole);
router.patch('/:id', auth_middleware_1.requireAuth, role_controller_1.RoleController.updateRole);
router.delete('/:id', auth_middleware_1.requireAuth, role_controller_1.RoleController.deleteRole);
exports.default = router;
