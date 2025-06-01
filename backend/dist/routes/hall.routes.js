"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Hall routes are working!' });
});
// Simple populate route for testing
router.get('/populate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({
            message: 'Populate endpoint working',
            note: 'Database already populated with real halls via direct connection'
        });
    }
    catch (error) {
        console.error('Error in populate route:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}));
// Protected routes (admin only)
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.createHall);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.updateHall);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hall_controller_1.deleteHall);
exports.default = router;
