"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const category_controller_1 = require("../controllers/category.controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', category_controller_1.CategoryController.getCategories);
router.post('/', auth_middleware_1.requireAuth, category_controller_1.CategoryController.createCategory);
router.put('/:id', auth_middleware_1.requireAuth, category_controller_1.CategoryController.updateCategory);
router.delete('/:id', auth_middleware_1.requireAuth, category_controller_1.CategoryController.deleteCategory);
router.get('/export', auth_middleware_1.requireAuth, category_controller_1.CategoryController.exportCategories);
router.post('/import', auth_middleware_1.requireAuth, upload.single('file'), category_controller_1.CategoryController.importCategories);
exports.default = router;
