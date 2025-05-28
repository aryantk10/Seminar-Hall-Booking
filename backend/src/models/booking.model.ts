import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  hall: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  attendees?: number;
  requirements?: string[];
  remarks?: string;
}

const bookingSchema = new Schema<IBooking>({
  hall: {
    type: Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  attendees: {
    type: Number,
    min: 1,
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  remarks: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure end time is after start time
bookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Index for querying bookings by date range
bookingSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema); 