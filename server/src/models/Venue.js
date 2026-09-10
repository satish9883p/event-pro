import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Unavailable', 'Booked'], default: 'Available' },
  },
  { _id: false }
);

const venueSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    venueType: { type: String, default: 'Banquet Hall' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    googleMapUrl: { type: String, default: '' },
    contactName: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    images: { type: [String], default: [] },
    capacity: { type: Number, default: 0 },
    amenities: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    availability: { type: [availabilitySchema], default: [] },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

venueSchema.index({ approvalStatus: 1, state: 1, district: 1, area: 1, city: 1, latitude: 1, longitude: 1 });

export default mongoose.model('Venue', venueSchema);
