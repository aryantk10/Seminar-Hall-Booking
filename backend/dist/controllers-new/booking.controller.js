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
exports.rejectBooking = exports.approveBooking = exports.deleteBooking = exports.updateBooking = exports.getBookingById = exports.getMyBookings = exports.getBookings = exports.createBooking = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const hall_model_1 = __importDefault(require("../models/hall.model"));
// Check for booking conflicts
const checkBookingConflict = (hallId, startTime, endTime, excludeBookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const conflictQuery = {
        hall: hallId,
        status: 'approved',
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            },
        ],
    };
    if (excludeBookingId) {
        Object.assign(conflictQuery, { _id: { $ne: excludeBookingId } });
    }
    const conflictingBooking = yield booking_model_1.default.findOne(conflictQuery);
    return conflictingBooking;
});
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hall: hallId, startTime, endTime } = req.body;
        // Check if hall exists
        const hall = yield hall_model_1.default.findById(hallId);
        if (!hall) {
            res.status(404).json({ message: 'Hall not found' });
            return;
        }
        // Check for conflicts
        const conflict = yield checkBookingConflict(hallId, new Date(startTime), new Date(endTime));
        if (conflict) {
            res.status(400).json({ message: 'Hall is already booked for this time slot' });
            return;
        }
        const booking = yield booking_model_1.default.create(Object.assign(Object.assign({}, req.body), { user: req.user._id, status: 'pending' }));
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.default.find({})
            .populate('user', 'name email')
            .populate('hall', 'name location');
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBookings = getBookings;
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.default.find({ user: req.user._id })
            .populate('hall', 'name location')
            .sort('-createdAt');
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMyBookings = getMyBookings;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('hall', 'name location');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Check if user is authorized to view this booking
        if (booking.user._id.toString() !== req.user._id && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to view this booking' });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBookingById = getBookingById;
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startTime, endTime, hall: hallId } = req.body;
        if (startTime && endTime && hallId) {
            const conflict = yield checkBookingConflict(hallId, new Date(startTime), new Date(endTime), req.params.id);
            if (conflict) {
                res.status(400).json({ message: 'Hall is already booked for this time slot' });
                return;
            }
        }
        const booking = yield booking_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateBooking = updateBooking;
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findByIdAndDelete(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteBooking = deleteBooking;
const approveBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Check for conflicts
        const conflict = yield checkBookingConflict(booking.hall.toString(), booking.startTime, booking.endTime, booking._id.toString());
        if (conflict) {
            res.status(400).json({ message: 'Hall is already booked for this time slot' });
            return;
        }
        booking.status = 'approved';
        yield booking.save();
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.approveBooking = approveBooking;
const rejectBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        booking.status = 'rejected';
        yield booking.save();
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.rejectBooking = rejectBooking;
