import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const additionalServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
});

const functionHallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide function hall name'],
      trim: true,
      maxlength: [100, 'Hall name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide function hall description'],
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'Please provide district'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please provide area/locality'],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, 'Please provide full address'],
    },
    mapQuery: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide hall capacity'],
      min: [10, 'Capacity must be at least 10'],
    },
    facilities: {
      type: [String],
      default: ['Air Conditioning', 'Power Backup', 'Stage', 'Parking'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide base price per day/slot'],
      min: [0, 'Price must be non-negative'],
    },
    additionalServices: {
      type: [additionalServiceSchema],
      default: [],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    availableTimeSlots: {
      type: [String],
      default: [
        'Morning Slot (08:00 AM - 02:00 PM)',
        'Evening Slot (04:00 PM - 10:00 PM)',
        'Full Day Slot (08:00 AM - 11:00 PM)',
      ],
    },
    type: {
      type: String,
      enum: [
        'Banquet Hall', 'Convention Center', 'Convention Hall',
        'Marriage Hall', 'Kalyana Mandapam', 'Party Lawn',
        'Rooftop Venue', 'Community Hall', 'Heritage Convention Hall',
        'Other'
      ],
      default: 'Banquet Hall',
    },
    acType: {
      type: String,
      enum: ['Central AC', 'Split AC', 'AC', 'Non-AC'],
      default: 'Central AC',
    },
    parking: {
      type: String,
      default: '100+ Vehicles with Valet Parking',
    },
    stage: {
      type: String,
      default: 'Grand 35x20 ft Stage with LED Lighting',
    },
    catering: {
      type: String,
      default: 'In-house & External Catering Allowed',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    availability: {
      type: String,
      enum: ['Available', 'Booked', 'Maintenance'],
      default: 'Available',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
functionHallSchema.index({ state: 1, district: 1, area: 1 });
functionHallSchema.index({ price: 1, capacity: 1 });
functionHallSchema.index({ name: 'text', description: 'text', area: 'text' });

export default mongoose.model('FunctionHall', functionHallSchema);
