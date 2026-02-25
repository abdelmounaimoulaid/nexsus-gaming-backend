"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const banner_controller_1 = require("../controllers/banner.controller");
const router = express_1.default.Router();
router.get('/', banner_controller_1.BannerController.getBanners);
router.post('/', auth_middleware_1.requireAuth, banner_controller_1.BannerController.createBanner);
router.put('/:id', auth_middleware_1.requireAuth, banner_controller_1.BannerController.updateBanner);
router.delete('/:id', auth_middleware_1.requireAuth, banner_controller_1.BannerController.deleteBanner);
exports.default = router;
