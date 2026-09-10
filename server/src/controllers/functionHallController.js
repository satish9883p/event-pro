import FunctionHall from '../models/FunctionHall.js';
import Booking from '../models/Booking.js';
import { validateFunctionHall } from '../utils/validators.js';

export const getFunctionHalls = async (req, res, next) => {
  try {
    const {
      state,
      district,
      area,
      type,
      acType,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      minRating,
      availability,
      date,
      search,
      page = 1,
      limit = 12,
      sortBy = 'rating',
    } = req.query;

    const filter = {};

    if (state) filter.state = { $regex: new RegExp(`^${state}$`, 'i') };
    if (district) filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
    if (area) filter.area = { $regex: new RegExp(area, 'i') };
    if (type && type !== 'All') filter.type = type;
    if (acType && acType !== 'All') filter.acType = acType;
    if (availability && availability !== 'All') filter.availability = availability;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minCapacity || maxCapacity) {
      filter.capacity = {};
      if (minCapacity) filter.capacity.$gte = Number(minCapacity);
      if (maxCapacity) filter.capacity.$lte = Number(maxCapacity);
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { fullAddress: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { rating: -1, createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };
    if (sortBy === 'capacity_desc') sortOptions = { capacity: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let halls = await FunctionHall.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions);

    // If date is provided, annotate booked slots for that date
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

      const bookedSlots = await Booking.find({
        hall: { $in: halls.map((h) => h._id) },
        date: { $gte: startOfDay, $lte: endOfDay },
        bookingStatus: { $in: ['confirmed', 'pending'] },
      }).select('hall timeSlot');

      const bookedMap = {};
      bookedSlots.forEach((b) => {
        const hId = b.hall.toString();
        if (!bookedMap[hId]) bookedMap[hId] = [];
        bookedMap[hId].push(b.timeSlot);
      });

      halls = halls.map((hall) => {
        const hallObj = hall.toObject();
        const bookedForHall = bookedMap[hall._id.toString()] || [];
        hallObj.bookedTimeSlots = bookedForHall;
        hallObj.allSlotsBooked =
          hallObj.availableTimeSlots.length > 0 &&
          hallObj.availableTimeSlots.every((s) => bookedForHall.includes(s));
        return hallObj;
      });
    }

    const total = await FunctionHall.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: halls,
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

export const getFunctionHallById = async (req, res, next) => {
  try {
    const hall = await FunctionHall.findById(req.params.id).populate('createdBy', 'name email');

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Function hall not found',
      });
    }

    // Fetch existing bookings for this hall for slot availability checking
    const upcomingBookings = await Booking.find({
      hall: hall._id,
      date: { $gte: new Date() },
      bookingStatus: { $in: ['confirmed', 'pending'] },
    }).select('date timeSlot bookingStatus');

    res.status(200).json({
      success: true,
      data: {
        ...hall.toObject(),
        existingBookings: upcomingBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createFunctionHall = async (req, res, next) => {
  try {
    const { error, value } = validateFunctionHall(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const hall = await FunctionHall.create({
      ...value,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Function hall created successfully',
      data: hall,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFunctionHall = async (req, res, next) => {
  try {
    const hall = await FunctionHall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Function hall not found',
      });
    }

    const { error, value } = validateFunctionHall(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const updatedHall = await FunctionHall.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Function hall updated successfully',
      data: updatedHall,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFunctionHall = async (req, res, next) => {
  try {
    const hall = await FunctionHall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Function hall not found',
      });
    }

    await FunctionHall.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Function hall deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addHallReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and comment',
      });
    }

    const hall = await FunctionHall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Function hall not found',
      });
    }

    const review = {
      user: req.user.userId,
      name: req.user.name || 'Verified Customer',
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    hall.reviews.push(review);
    hall.reviewCount = hall.reviews.length;
    const totalScore = hall.reviews.reduce((acc, item) => acc + item.rating, 0);
    hall.rating = Number((totalScore / hall.reviews.length).toFixed(1));

    await hall.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: hall,
    });
  } catch (error) {
    next(error);
  }
};

export const checkHallSlotAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.query;

    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and timeSlot query parameters',
      });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const existingBooking = await Booking.findOne({
      hall: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      bookingStatus: { $in: ['confirmed', 'pending'] },
    });

    res.status(200).json({
      success: true,
      available: !existingBooking,
      message: existingBooking ? 'Slot is already booked' : 'Slot is available for booking',
    });
  } catch (error) {
    next(error);
  }
};
