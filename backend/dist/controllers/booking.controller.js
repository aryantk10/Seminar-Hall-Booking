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
exports.rejectBooking = exports.approveBooking = exports.cancelBooking = exports.deleteBooking = exports.updateBooking = exports.getBookingById = exports.getApprovedBookings = exports.getMyBookings = exports.getBookings = exports.createBooking = void 0;
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
        const { hallId, startDate, endDate, purpose, attendees, requirements } = req.body;
        console.log('🎯 Booking request received:', { hallId, startDate, endDate, purpose });
        console.log('🔧 DEPLOYMENT TEST - Using Test Hall mapping for all halls');
        // Map frontend hall IDs to actual database hall names
        const hallMapping = {
            // Full hall IDs (correct format) - map to actual database hall names
            'apex-auditorium': 'APEX Auditorium',
            'esb-hall-1': 'ESB Seminar Hall - I',
            'esb-hall-2': 'ESB Seminar Hall - II',
            'esb-hall-3': 'ESB Seminar Hall - III',
            'des-hall-1': 'DES Seminar Hall - I',
            'des-hall-2': 'DES Seminar Hall - II',
            'lhc-hall-1': 'LHC Seminar Hall - I',
            'lhc-hall-2': 'LHC Seminar Hall - II',
            // Short hall IDs (for backward compatibility)
            'apex': 'APEX Auditorium',
            'esb1': 'ESB Seminar Hall - I',
            'esb2': 'ESB Seminar Hall - II',
            'esb3': 'ESB Seminar Hall - III',
            'des1': 'DES Seminar Hall - I',
            'des2': 'DES Seminar Hall - II',
            'lhc1': 'LHC Seminar Hall - I',
            'lhc2': 'LHC Seminar Hall - II'
        };
        const hallName = hallMapping[hallId] || hallId;
        console.log('🏢 Looking for hall:', { hallId, mappedName: hallName });
        const hall = yield hall_model_1.default.findOne({ name: hallName });
        if (!hall) {
            console.log('❌ Hall not found in database:', hallName);
            console.log('📋 Available halls:', yield hall_model_1.default.find({}, 'name').lean());
            res.status(404).json({ message: `Hall not found: ${hallName}` });
            return;
        }
        console.log('✅ Hall found:', { id: hall._id, name: hall.name });
        // Parse dates and extract time from requirements
        const startTime = new Date(startDate);
        const endTime = new Date(endDate);
        // Extract time from requirements if provided
        if (requirements && typeof requirements === 'string' && requirements.includes('Time:')) {
            const timeMatch = requirements.match(/Time:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
            if (timeMatch) {
                const [, startTimeStr, endTimeStr] = timeMatch;
                const [startHour, startMin] = startTimeStr.split(':').map(Number);
                const [endHour, endMin] = endTimeStr.split(':').map(Number);
                startTime.setHours(startHour, startMin, 0, 0);
                endTime.setHours(endHour, endMin, 0, 0);
                console.log('⏰ Time extracted from requirements:', { startTime, endTime });
            }
        }
        console.log('📅 Final booking times:', { startTime, endTime });
        // Check for conflicts
        const conflict = yield checkBookingConflict(hall._id.toString(), startTime, endTime);
        if (conflict) {
            console.log('⚠️ Booking conflict detected:', conflict);
            res.status(400).json({ message: 'Hall is already booked for this time slot' });
            return;
        }
        console.log('✅ No conflicts found, creating booking...');
        const booking = yield booking_model_1.default.create({
            hall: hall._id,
            user: req.user._id,
            startTime,
            endTime,
            purpose,
            attendees: attendees || 1,
            requirements: requirements ? [requirements] : [],
            status: 'pending',
        });
        console.log('🎉 Booking created successfully:', booking._id);
        // Populate the response
        const populatedBooking = yield booking_model_1.default.findById(booking._id)
            .populate('hall', 'name location')
            .populate('user', 'name email');
        console.log('📤 Sending response with populated booking');
        res.status(201).json(populatedBooking);
    }
    catch (error) {
        console.error('❌ Booking creation error:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
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
        console.log('🔍 getMyBookings called for user:', req.user._id);
        // First, get all bookings to debug
        const allBookings = yield booking_model_1.default.find({})
            .populate('hall', 'name location')
            .populate('user', 'name email');
        console.log('📊 Total bookings in database:', allBookings.length);
        console.log('📊 All bookings:', allBookings.map(b => {
            var _a, _b, _c;
            return ({
                id: b._id,
                userId: ((_a = b.user) === null || _a === void 0 ? void 0 : _a._id) || b.user,
                userName: (_b = b.user) === null || _b === void 0 ? void 0 : _b.name,
                hallName: (_c = b.hall) === null || _c === void 0 ? void 0 : _c.name,
                purpose: b.purpose
            });
        }));
        // Now get user-specific bookings with proper population
        const bookings = yield booking_model_1.default.find({ user: req.user._id })
            .populate('hall', 'name location')
            .populate('user', 'name email') // Add user population
            .sort('-createdAt');
        console.log('📊 User bookings found:', bookings.length);
        console.log('📊 User bookings:', bookings.map(b => {
            var _a;
            return ({
                id: b._id,
                hallName: (_a = b.hall) === null || _a === void 0 ? void 0 : _a.name,
                purpose: b.purpose,
                status: b.status
            });
        }));
        res.json(bookings);
    }
    catch (error) {
        console.error('❌ getMyBookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMyBookings = getMyBookings;
// Get approved bookings for calendar view (public access for all authenticated users)
const getApprovedBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.default.find({ status: 'approved' })
            .populate('hall', 'name location')
            .populate('user', 'name')
            .sort('-createdAt');
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApprovedBookings = getApprovedBookings;
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
        const booking = yield booking_model_1.default.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Check if the user is the owner of the booking or an admin
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to delete this booking' });
            return;
        }
        yield booking_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteBooking = deleteBooking;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Check if the user is the owner of the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to cancel this booking' });
            return;
        }
        booking.status = 'cancelled';
        yield booking.save();
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.cancelBooking = cancelBooking;
const approveBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Allow changing from any status to approved
        if (booking.status === 'cancelled') {
            res.status(400).json({ message: 'Cannot approve a cancelled booking' });
            return;
        }
        // Check for conflicts
        const conflict = yield checkBookingConflict(booking.hall.toString(), booking.startTime, booking.endTime, booking._id);
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
        // Allow changing from any status to rejected except cancelled
        if (booking.status === 'cancelled') {
            res.status(400).json({ message: 'Cannot reject a cancelled booking' });
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
