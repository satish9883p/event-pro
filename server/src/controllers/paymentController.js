import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import { env } from '../config/env.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a booking that's in payment_pending state.
 * The booking must already exist with bookingStatus = 'payment_pending'.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    // Find the booking (by our internal bookingId string or MongoDB _id)
    const isObjectId = bookingId.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: bookingId } : { bookingId: bookingId.toUpperCase() };
    const booking = await Booking.findOne(filter);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Security: only the booking owner can initiate payment
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This booking is already paid' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot pay for a cancelled booking' });
    }

    // Create Razorpay order (amount in paise — multiply by 100)
    const amount = Math.round(booking.totalPrice * 100);
    const currency = 'INR';

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        userId: req.user.userId,
        platform: 'Event Pro',
      },
    });

    // Store razorpayOrderId in our booking
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
        bookingId: booking.bookingId,
        _id: booking._id,
      },
    });
  } catch (error) {
    // Handle Razorpay API errors gracefully
    if (error && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.error?.description || 'Razorpay order creation failed',
      });
    }
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Verifies the Razorpay payment signature and confirms the booking.
 * NEVER stores card details, CVV, or UPI PIN — only IDs and signature hash.
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      paymentMethod,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields',
      });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Payment signature mismatch — mark as failed
      const isObjectId = bookingId.match(/^[0-9a-fA-F]{24}$/);
      const filter = isObjectId ? { _id: bookingId } : { bookingId: bookingId.toUpperCase() };
      await Booking.findOneAndUpdate(filter, {
        paymentStatus: 'failed',
        bookingStatus: 'payment_pending', // keep pending so user can retry
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature',
      });
    }

    // Signature is valid — confirm the booking
    const isObjectId = bookingId.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: bookingId } : { bookingId: bookingId.toUpperCase() };

    const booking = await Booking.findOneAndUpdate(
      filter,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: paymentMethod || 'other',
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      },
      { new: true }
    )
      .populate('hall')
      .populate('event')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Booking is confirmed.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler. Uses raw body for signature verification.
 * Handles: payment.captured, payment.failed
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook authenticity
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const payment = payload.payment?.entity;
      if (payment?.order_id) {
        // Find by razorpayOrderId and confirm
        const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
        if (booking && booking.paymentStatus !== 'paid') {
          booking.razorpayPaymentId = payment.id;
          booking.paymentStatus = 'paid';
          booking.bookingStatus = 'confirmed';
          booking.paymentMethod = payment.method || 'other';
          await booking.save();
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment?.entity;
      if (payment?.order_id) {
        const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
        if (booking) {
          booking.paymentStatus = 'failed';
          // Keep bookingStatus as payment_pending so user can retry
          await booking.save();
        }
      }
    }

    // Always acknowledge webhook immediately
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    // Always return 200 to Razorpay to avoid retries
    console.error('Webhook error:', error);
    return res.status(200).json({ status: 'ok' });
  }
};
