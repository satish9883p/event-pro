import User from '../models/User.js';
import Event from '../models/Event.js';
import FunctionHall from '../models/FunctionHall.js';
import Booking from '../models/Booking.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'Published' });
    const totalHalls = await FunctionHall.countDocuments();
    const availableHalls = await FunctionHall.countDocuments({ availability: 'Available' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    // Aggregate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email phone')
      .populate('hall', 'name area state')
      .populate('event', 'title date venue');

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalEvents,
        publishedEvents,
        totalHalls,
        availableHalls,
        totalUsers,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach booking counts
    const userIds = users.map((u) => u._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    bookingCounts.forEach((bc) => {
      countMap[bc._id.toString()] = bc.count;
    });

    const enrichedUsers = users.map((u) => {
      const obj = u.toObject();
      obj.bookingCount = countMap[u._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { hallId, reviewId } = req.params;

    const hall = await FunctionHall.findById(hallId);
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Function hall not found',
      });
    }

    hall.reviews = hall.reviews.filter((r) => r._id.toString() !== reviewId);
    hall.reviewCount = hall.reviews.length;
    if (hall.reviews.length > 0) {
      const totalScore = hall.reviews.reduce((acc, item) => acc + item.rating, 0);
      hall.rating = Number((totalScore / hall.reviews.length).toFixed(1));
    } else {
      hall.rating = 5.0;
    }

    await hall.save();

    res.status(200).json({
      success: true,
      message: 'Review removed successfully',
      data: hall,
    });
  } catch (error) {
    next(error);
  }
};
