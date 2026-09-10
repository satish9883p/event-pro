import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: [true, 'Please provide state name'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'Please provide district name'],
      trim: true,
    },
    areas: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ state: 1, district: 1 }, { unique: true });

export default mongoose.model('Location', locationSchema);
