import mongoose, { Document, Schema } from 'mongoose';

export interface IHall extends Document {
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
  isAvailable: boolean;
  images?: string[];
  frontendId: string;
}

const hallSchema = new Schema<IHall>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  facilities: [{
    type: String,
    trim: true,
  }],
  description: {
    type: String,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  frontendId: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  }
}, {
  timestamps: true,
});

export default mongoose.model<IHall>('Hall', hallSchema); 