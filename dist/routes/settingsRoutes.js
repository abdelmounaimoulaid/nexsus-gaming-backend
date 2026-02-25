"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public route to fetch necessary global site settings
router.get('/', settingsController_1.getSettings);
// Protected admin route to save global site settings
router.put('/', auth_middleware_1.requireAuth, settingsController_1.updateSettings);
exports.default = router;
