"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const section_controller_1 = require("../controllers/section.controller");
const router = express_1.default.Router();
router.get('/', section_controller_1.SectionController.getSections);
router.post('/', auth_middleware_1.requireAuth, section_controller_1.SectionController.createSection);
router.put('/reorder', auth_middleware_1.requireAuth, section_controller_1.SectionController.reorderSections);
router.put('/:id', auth_middleware_1.requireAuth, section_controller_1.SectionController.updateSection);
router.delete('/:id', auth_middleware_1.requireAuth, section_controller_1.SectionController.deleteSection);
exports.default = router;
