import mongoose from 'mongoose';

const venueBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    numberOfPeople: { type: Number, default: 1 },
    purpose: { type: String, default: '' },
    notes: { type: String, default: '' },
    contactName: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
    requestDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

venueBookingSchema.index({ venueId: 1, bookingDate: 1, status: 1 });

export default mongoose.model('VenueBooking', venueBookingSchema);
