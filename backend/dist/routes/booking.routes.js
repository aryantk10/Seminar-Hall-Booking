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
const booking_controller_1 = require("../controllers/booking.controller");
const router = express_1.default.Router();
router.route('/')
    .post(auth_middleware_1.protect, booking_controller_1.createBooking)
    .get(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.getBookings);
router.route('/my').get(auth_middleware_1.protect, booking_controller_1.getMyBookings);
router.route('/approved').get(auth_middleware_1.protect, booking_controller_1.getApprovedBookings); // Public calendar data
// Cleanup endpoint to remove corrupted bookings (public access for debugging)
router.route('/cleanup').get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Booking = require('../models/booking.model').default;
        // Remove bookings with null users or test halls
        const result = yield Booking.deleteMany({
            $or: [
                { user: null },
                { user: { $exists: false } },
                { 'hall.name': 'Test Hall' },
                { hall: null },
                { hall: { $exists: false } }
            ]
        });
        res.json({
            message: `Cleaned up ${result.deletedCount} corrupted bookings`,
            deletedCount: result.deletedCount
        });
    }
    catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ message: 'Cleanup failed' });
    }
}));
router.route('/:id')
    .get(auth_middleware_1.protect, booking_controller_1.getBookingById)
    .delete(auth_middleware_1.protect, booking_controller_1.cancelBooking); // Allow users to delete their own bookings
router.route('/:id/cancel')
    .post(auth_middleware_1.protect, booking_controller_1.cancelBooking);
router.route('/:id/approve')
    .put(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.approveBooking); // Changed to PUT
router.route('/:id/reject')
    .put(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.rejectBooking); // Changed to PUT
exports.default = router;
