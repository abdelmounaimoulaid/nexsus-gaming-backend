"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whishlist_controller_1 = require("../controllers/whishlist.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/toggle', auth_middleware_1.requireAuth, whishlist_controller_1.WhishlistController.toggleWhishlist);
router.get('/', auth_middleware_1.requireAuth, whishlist_controller_1.WhishlistController.getWhishlist);
router.post('/sync', auth_middleware_1.requireAuth, whishlist_controller_1.WhishlistController.syncWhishlist);
exports.default = router;
