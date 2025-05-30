"use strict";
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
router.route('/my').get(auth_middleware_1.protect, booking_controller_1.getBookings);
router.route('/:id')
    .get(auth_middleware_1.protect, booking_controller_1.getBookingById)
    .post(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.approveBooking)
    .delete(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.rejectBooking);
router.route('/:id/cancel')
    .post(auth_middleware_1.protect, booking_controller_1.cancelBooking);
router.route('/:id/approve')
    .post(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.approveBooking);
router.route('/:id/reject')
    .post(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.rejectBooking);
exports.default = router;
