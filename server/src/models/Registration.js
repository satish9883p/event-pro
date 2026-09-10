import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled', 'attended'],
      default: 'registered',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Prevent duplicate registration middleware
registrationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existing = await mongoose.model('Registration').findOne({
      user: this.user,
      event: this.event,
    });
    if (existing) {
      throw new Error('User is already registered for this event');
    }
  }
  next();
});

export default mongoose.model('Registration', registrationSchema);
