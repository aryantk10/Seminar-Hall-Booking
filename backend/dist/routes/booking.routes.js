"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const booking_controller_1 = require("../controllers/booking.controller");
const router = express_1.default.Router();
// Protected routes (all authenticated users)
router.use(auth_middleware_1.protect);
// Routes for all authenticated users
router.post('/', booking_controller_1.createBooking);
router.get('/my-bookings', booking_controller_1.getMyBookings);
router.get('/:id', booking_controller_1.getBookingById);
// Admin only routes
router.get('/', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.getBookings);
router.put('/:id', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.updateBooking);
router.delete('/:id', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.deleteBooking);
router.put('/:id/approve', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.approveBooking);
router.put('/:id/reject', (0, auth_middleware_1.authorize)('admin'), booking_controller_1.rejectBooking);
exports.default = router;
