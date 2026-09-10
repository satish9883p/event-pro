import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [100, 'Event title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide event category'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Please provide organizer name'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    timeSlots: {
      type: [String],
      default: ['Morning Session (09:00 AM - 01:00 PM)', 'Afternoon Session (02:00 PM - 06:00 PM)'],
    },
    venue: {
      type: String,
      required: [true, 'Please provide venue'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location description'],
    },
    state: {
      type: String,
      default: 'Andhra Pradesh',
    },
    district: {
      type: String,
      default: 'Krishna',
    },
    area: {
      type: String,
      default: 'Vijayawada',
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide event capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableSlots: {
      type: Number,
      default: function () {
        return this.capacity;
      },
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please provide registration deadline'],
    },
    image: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: String,
      default: 'All',
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide contact email'],
    },
    contactPhone: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Completed', 'Cancelled'],
      default: 'Published',
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

// Indexes for efficient queries
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ state: 1, district: 1, area: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);
