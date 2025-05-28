import cron from 'node-cron';
import User from '../models/user.model';
import Booking, { IBooking } from '../models/booking.model';
import { Document, Types } from 'mongoose';

// Define the populated booking type
type BookingDocument = Document<unknown, {}, IBooking> & IBooking & { _id: Types.ObjectId };

class CronService {
    constructor() {
        // Update expired bookings status
        cron.schedule('*/15 * * * *', async () => {
            try {
                // Update expired bookings to 'completed'
                await Booking.updateMany(
                    {
                        status: 'approved',
                        endTime: { $lt: new Date() }
                    },
                    {
                        $set: { status: 'completed' }
                    }
                );

                console.log('Updated expired bookings status');
            } catch (error) {
                console.error('Cron job failed:', error);
            }
        });
    }
}

export const cronService = new CronService(); 