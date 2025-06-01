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
    try {
        const hall = yield hall_model_1.default.create(req.body);
        res.status(201).json(hall);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
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
    try {
        const hall = yield hall_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
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
exports.updateHall = updateHall;
const deleteHall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hall = yield hall_model_1.default.findByIdAndDelete(req.params.id);
        if (!hall) {
            res.status(404).json({ message: 'Hall not found' });
            return;
        }
        // Delete all bookings associated with this hall
        yield booking_model_1.default.deleteMany({ hall: req.params.id });
        res.json({ message: 'Hall deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
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
