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
exports.populateHalls = exports.getHallAvailability = exports.deleteHall = exports.updateHall = exports.getHallById = exports.getHalls = exports.createHall = void 0;
const hall_model_1 = __importDefault(require("../models/hall.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const createHall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, capacity, location, facilities, description, images } = req.body;
        // Validate required fields
        if (!name || !capacity || !location) {
            res.status(400).json({ message: 'Name, capacity, and location are required' });
            return;
        }
        // Check if hall with same name already exists
        const existingHall = yield hall_model_1.default.findOne({ name });
        if (existingHall) {
            res.status(400).json({ message: 'Hall with this name already exists' });
            return;
        }
        const hallData = {
            name,
            capacity: parseInt(capacity),
            location,
            facilities: facilities || [],
            description: description || '',
            images: images || []
        };
        const hall = yield hall_model_1.default.create(hallData);
        console.log(`✅ Hall created: ${name} by ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'Admin'}`);
        res.status(201).json(hall);
    }
    catch (error) {
        console.error('❌ Error creating hall:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});
exports.createHall = createHall;
const getHalls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const halls = yield hall_model_1.default.find({});
        res.json(halls);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getHalls = getHalls;
const getHallById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hall = yield hall_model_1.default.findById(req.params.id);
        if (!hall) {
            res.status(404).json({ message: 'Hall not found' });
            return;
        }
        res.json(hall);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getHallById = getHallById;
const updateHall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, capacity, location, facilities, description, images } = req.body;
        const hallId = req.params.id;
        // Check if hall exists
        const existingHall = yield hall_model_1.default.findById(hallId);
        if (!existingHall) {
            res.status(404).json({ message: 'Hall not found' });
            return;
        }
        // If name is being changed, check for duplicates
        if (name && name !== existingHall.name) {
            const duplicateHall = yield hall_model_1.default.findOne({ name, _id: { $ne: hallId } });
            if (duplicateHall) {
                res.status(400).json({ message: 'Hall with this name already exists' });
                return;
            }
        }
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (capacity)
            updateData.capacity = parseInt(capacity);
        if (location)
            updateData.location = location;
        if (facilities)
            updateData.facilities = facilities;
        if (description !== undefined)
            updateData.description = description;
        if (images)
            updateData.images = images;
        // Update the hall
        const hall = yield hall_model_1.default.findByIdAndUpdate(hallId, updateData, {
            new: true,
            runValidators: true,
        });
        console.log(`✅ Hall updated: ${hall === null || hall === void 0 ? void 0 : hall.name} (ID: ${hallId}) by ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'Admin'}`);
        res.json({
            message: 'Hall updated successfully',
            hall
        });
    }
    catch (error) {
        console.error('❌ Error updating hall:', error);
        res.status(500).json({
            message: 'Error updating hall',
            error: error.message
        });
    }
});
exports.updateHall = updateHall;
const deleteHall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const hallId = req.params.id;
        // Check if hall exists
        const hall = yield hall_model_1.default.findById(hallId);
        if (!hall) {
            res.status(404).json({ message: 'Hall not found' });
            return;
        }
        // Check for existing bookings
        const existingBookings = yield booking_model_1.default.find({ hall: hallId });
        const activeBookings = existingBookings.filter(booking => booking.status === 'approved' || booking.status === 'pending');
        if (activeBookings.length > 0) {
            res.status(400).json({
                message: `Cannot delete hall. There are ${activeBookings.length} active bookings.`,
                activeBookings: activeBookings.length
            });
            return;
        }
        // Delete the hall
        yield hall_model_1.default.findByIdAndDelete(hallId);
        // Delete all associated bookings (cancelled/rejected ones)
        const deletedBookings = yield booking_model_1.default.deleteMany({ hall: hallId });
        console.log(`✅ Hall deleted: ${hall.name} (ID: ${hallId}) by ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'Admin'}`);
        console.log(`✅ Deleted ${deletedBookings.deletedCount} associated bookings`);
        res.json({
            message: 'Hall deleted successfully',
            deletedBookings: deletedBookings.deletedCount,
            hallName: hall.name
        });
    }
    catch (error) {
        console.error('❌ Error deleting hall:', error);
        res.status(500).json({
            message: 'Error deleting hall',
            error: error.message
        });
    }
});
exports.deleteHall = deleteHall;
const getHallAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ message: 'Please provide start and end dates' });
            return;
        }
        const bookings = yield booking_model_1.default.find({
            hall: req.params.id,
            $or: [
                {
                    startTime: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
                {
                    endTime: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            ],
        }).select('startTime endTime status');
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getHallAvailability = getHallAvailability;
const populateHalls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting hall population...');
        // Clear existing halls
        const deleteResult = yield hall_model_1.default.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing halls`);
        const hallsData = [
            {
                name: 'APEX Auditorium',
                capacity: 1000,
                location: 'APEX Block',
                facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'],
                description: 'Large auditorium for major events',
                isAvailable: true
            },
            {
                name: 'ESB Seminar Hall - I',
                capacity: 315,
                location: 'Engineering Sciences Block (ESB)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
                description: 'Seminar hall in ESB',
                isAvailable: true
            },
            {
                name: 'ESB Seminar Hall - II',
                capacity: 315,
                location: 'Engineering Sciences Block (ESB)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
                description: 'Seminar hall in ESB',
                isAvailable: true
            },
            {
                name: 'ESB Seminar Hall - III',
                capacity: 140,
                location: 'Engineering Sciences Block (ESB)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
                description: 'Smaller seminar hall in ESB',
                isAvailable: true
            },
            {
                name: 'DES Seminar Hall - I',
                capacity: 200,
                location: 'Department of Engineering Sciences (DES)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Whiteboard'],
                description: 'Seminar hall in DES',
                isAvailable: true
            },
            {
                name: 'DES Seminar Hall - II',
                capacity: 200,
                location: 'Department of Engineering Sciences (DES)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Whiteboard'],
                description: 'Seminar hall in DES',
                isAvailable: true
            },
            {
                name: 'LHC Seminar Hall - I',
                capacity: 115,
                location: 'Lecture Hall Complex (LHC)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
                description: 'Seminar hall in LHC',
                isAvailable: true
            },
            {
                name: 'LHC Seminar Hall - II',
                capacity: 115,
                location: 'Lecture Hall Complex (LHC)',
                facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
                description: 'Seminar hall in LHC',
                isAvailable: true
            }
        ];
        console.log(`Attempting to create ${hallsData.length} halls...`);
        const createdHalls = yield hall_model_1.default.insertMany(hallsData);
        console.log(`Successfully created ${createdHalls.length} halls`);
        res.json({
            message: `Successfully created ${createdHalls.length} halls`,
            halls: createdHalls.map(hall => ({
                id: hall._id,
                name: hall.name,
                capacity: hall.capacity,
                location: hall.location
            }))
        });
    }
    catch (error) {
        console.error('Error populating halls:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.populateHalls = populateHalls;
