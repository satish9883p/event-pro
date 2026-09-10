import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['hall', 'event'],
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FunctionHall',
      default: null,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Please provide booking date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide time slot'],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalServices: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // ---- Razorpay Payment Fields ----
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'emi', 'other', null],
      default: null,
    },
    // ---- Payment & Booking Status ----
    paymentStatus: {
      type: String,
      enum: ['awaiting_payment', 'pending', 'paid', 'failed', 'refunded'],
      default: 'awaiting_payment',
    },
    bookingStatus: {
      type: String,
      enum: ['payment_pending', 'confirmed', 'pending', 'cancelled', 'completed'],
      default: 'payment_pending',
    },
    guestCount: {
      type: Number,
      default: 1,
    },
    contactName: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hall: 1, date: 1, timeSlot: 1 });
bookingSchema.index({ event: 1, date: 1, timeSlot: 1 });
bookingSchema.index({ razorpayOrderId: 1 });

export default mongoose.model('Booking', bookingSchema);
