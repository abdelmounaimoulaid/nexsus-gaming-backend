"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const brand_controller_1 = require("../controllers/brand.controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', brand_controller_1.BrandController.getBrands);
router.get('/:id', brand_controller_1.BrandController.getBrandById);
router.post('/', auth_middleware_1.requireAuth, brand_controller_1.BrandController.createBrand);
router.put('/:id', auth_middleware_1.requireAuth, brand_controller_1.BrandController.updateBrand);
router.delete('/:id', auth_middleware_1.requireAuth, brand_controller_1.BrandController.deleteBrand);
router.get('/data/export', auth_middleware_1.requireAuth, brand_controller_1.BrandController.exportBrands);
router.post('/data/import', auth_middleware_1.requireAuth, upload.single('file'), brand_controller_1.BrandController.importBrands);
exports.default = router;
