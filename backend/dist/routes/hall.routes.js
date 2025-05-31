"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const hall_controller_1 = require("../controllers-new/hall.controller");
const router = express_1.default.Router();
// Public routes
router.get('/', hall_controller_1.getHalls);
router.get('/:id', hall_controller_1.getHallById);
router.get('/:id/availability', hall_controller_1.getHallAvailability);
// Protected routes (admin only)
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.createHall);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.updateHall);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.deleteHall);
exports.default = router;
