import Booking from '../models/Booking.js';
import FunctionHall from '../models/FunctionHall.js';
import Event from '../models/Event.js';
import { validateBooking } from '../utils/validators.js';

// Helper to generate unique Booking ID
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `EP-${dateStr}-${randomStr}`;
};

export const createBooking = async (req, res, next) => {
  try {
    const { error, value } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      bookingType,
      hallId,
      eventId,
      date,
      timeSlot,
      basePrice,
      additionalServices = [],
      guestCount = 1,
      contactName,
      contactPhone,
      contactEmail,
      specialRequests,
    } = value;

    const bookingDate = new Date(date);
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    let finalBasePrice = Number(basePrice) || 0;
    let targetHall = null;
    let targetEvent = null;

    if (bookingType === 'hall') {
      if (!hallId) {
        return res.status(400).json({
          success: false,
          message: 'Function hall ID is required for hall booking',
        });
      }

      targetHall = await FunctionHall.findById(hallId);
      if (!targetHall) {
        return res.status(404).json({
          success: false,
          message: 'Function hall not found',
        });
      }

      // Check slot conflict
      const conflictingBooking = await Booking.findOne({
        hall: hallId,
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        bookingStatus: { $in: ['confirmed', 'pending'] },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          success: false,
          message: `This time slot (${timeSlot}) is already booked for ${bookingDate.toDateString()}`,
        });
      }

      finalBasePrice = targetHall.price;
    } else if (bookingType === 'event') {
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required for event booking',
        });
      }

      targetEvent = await Event.findById(eventId);
      if (!targetEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      if (targetEvent.status === 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot book a cancelled event',
        });
      }

      if (targetEvent.availableSlots <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Sorry, this event is already fully booked',
        });
      }

      finalBasePrice = targetEvent.price || 0;

      // Decrement available slots
      targetEvent.availableSlots = Math.max(0, targetEvent.availableSlots - 1);
      await targetEvent.save();
    }

    // Calculate additional services sum
    const servicesTotal = additionalServices.reduce(
      (sum, s) => sum + (Number(s.price) || 0),
      0
    );
    const totalPrice = finalBasePrice + servicesTotal;

    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      user: req.user.userId,
      bookingType,
      hall: bookingType === 'hall' ? hallId : null,
      event: bookingType === 'event' ? eventId : null,
      date: bookingDate,
      timeSlot,
      basePrice: finalBasePrice,
      additionalServices,
      totalPrice,
      // Booking starts as payment_pending — confirmed only after Razorpay payment verified
      paymentStatus: 'awaiting_payment',
      bookingStatus: 'payment_pending',
      guestCount,
      contactName: contactName || req.user.name || '',
      contactPhone: contactPhone || req.user.phone || '',
      contactEmail: contactEmail || req.user.email || '',
      specialRequests: specialRequests || '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('hall')
      .populate('event')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking reserved! Complete payment to confirm.',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = { user: req.user.userId };

    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }
    if (type && type !== 'all') {
      filter.bookingType = type;
    }

    const bookings = await Booking.find(filter)
      .populate('hall')
      .populate('event')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { bookingId: id.toUpperCase() };

    const booking = await Booking.findOne(filter)
      .populate('hall')
      .populate('event')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Security check: only the user or admin can view
    if (
      booking.user._id.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (
      booking.user.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    booking.paymentStatus = 'refunded';
    await booking.save();

    // If event booking, increment available slots back
    if (booking.bookingType === 'event' && booking.event) {
      await Event.findByIdAndUpdate(booking.event, {
        $inc: { availableSlots: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully according to cancellation policy',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.bookingStatus = status;
    if (type && type !== 'all') filter.bookingType = type;
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('hall')
      .populate('event')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
