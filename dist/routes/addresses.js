"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const address_controller_1 = require("../controllers/address.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const order_validation_1 = require("../validations/order.validation");
const router = express_1.default.Router();
router.get('/my', auth_middleware_1.requireAuth, address_controller_1.AddressController.getMyAddresses);
router.post('/', auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(order_validation_1.createAddressSchema), address_controller_1.AddressController.createAddress);
router.patch('/:id', auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(order_validation_1.updateAddressSchema), address_controller_1.AddressController.updateAddress);
router.delete('/:id', auth_middleware_1.requireAuth, address_controller_1.AddressController.deleteAddress);
router.post('/:id/set-default', auth_middleware_1.requireAuth, address_controller_1.AddressController.setDefault);
exports.default = router;
