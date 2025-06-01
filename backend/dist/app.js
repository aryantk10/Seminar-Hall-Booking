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
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./services/cron.service");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const hall_routes_1 = __importDefault(require("./routes/hall.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:9002',
    'https://seminar-hall-booking.onrender.com',
    'https://seminar-hall-booking-j69q.onrender.com',
    'https://seminar-hall-booking-psi.vercel.app'
];
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Seminar Hall Booking API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Debug route to test API
app.get('/api', (req, res) => {
    res.json({
        message: 'API is working',
        routes: ['auth', 'halls', 'bookings'],
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT
    });
});
// Removed conflicting test routes that were blocking real auth routes
// API Routes
console.log('Registering auth routes...');
try {
    app.use('/api/auth', auth_routes_1.default);
    console.log('✅ Auth routes registered successfully');
}
catch (error) {
    console.error('❌ Error registering auth routes:', error);
}
console.log('Registering hall routes...');
try {
    app.use('/api/halls', hall_routes_1.default);
    console.log('✅ Hall routes registered successfully');
}
catch (error) {
    console.error('❌ Error registering hall routes:', error);
}
console.log('Registering booking routes...');
try {
    app.use('/api/bookings', booking_routes_1.default);
    console.log('✅ Booking routes registered successfully');
}
catch (error) {
    console.error('❌ Error registering booking routes:', error);
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
// MongoDB connection
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seminar-hall-booking';
        console.log('Connecting to MongoDB:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        yield mongoose_1.default.connect(mongoURI);
        console.log('MongoDB connected successfully');
        console.log('Database name:', mongoose_1.default.connection.db.databaseName);
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
});
// Start server
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
});
startServer();
