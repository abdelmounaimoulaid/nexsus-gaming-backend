"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const collection_controller_1 = require("../controllers/collection.controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', collection_controller_1.CollectionController.getCollections);
router.get('/:id', collection_controller_1.CollectionController.getCollectionById);
router.post('/', auth_middleware_1.requireAuth, collection_controller_1.CollectionController.createCollection);
router.put('/:id', auth_middleware_1.requireAuth, collection_controller_1.CollectionController.updateCollection);
router.delete('/:id', auth_middleware_1.requireAuth, collection_controller_1.CollectionController.deleteCollection);
router.get('/data/export', auth_middleware_1.requireAuth, collection_controller_1.CollectionController.exportCollections);
router.post('/data/import', auth_middleware_1.requireAuth, upload.single('file'), collection_controller_1.CollectionController.importCollections);
exports.default = router;
