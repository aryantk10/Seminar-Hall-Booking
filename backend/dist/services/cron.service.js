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
exports.cronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
class CronService {
    constructor() {
        // Update expired bookings status
        node_cron_1.default.schedule('*/15 * * * *', () => __awaiter(this, void 0, void 0, function* () {
            try {
                // Update expired bookings to 'completed'
                yield booking_model_1.default.updateMany({
                    status: 'approved',
                    endTime: { $lt: new Date() }
                }, {
                    $set: { status: 'completed' }
                });
                console.log('Updated expired bookings status');
            }
            catch (error) {
                console.error('Cron job failed:', error);
            }
        }));
    }
}
exports.cronService = new CronService();
