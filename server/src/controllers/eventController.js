import Event from '../models/Event.js';
import { validateEvent } from '../utils/validators.js';

export const getEvents = async (req, res, next) => {
  try {
    const {
      category,
      startDate,
      endDate,
      date,
      location,
      state,
      district,
      area,
      minPrice,
      maxPrice,
      status,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (status) {
      if (status !== 'All') filter.status = status;
    } else {
      filter.status = 'Published';
    }

    if (category && category !== 'All') filter.category = category;
    if (state && state !== 'All') filter.state = { $regex: new RegExp(`^${state}$`, 'i') };
    if (district && district !== 'All') filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
    if (area && area !== 'All') filter.area = { $regex: new RegExp(area, 'i') };
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (date) {
      const qDate = new Date(date);
      const startOfDay = new Date(qDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(qDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: events,
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

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { error, value } = validateEvent(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const locationText =
      value.location ||
      [value.venue, value.area, value.district, value.state].filter(Boolean).join(', ');

    const regDeadline = value.registrationDeadline || value.date;
    const contactEmail = value.contactEmail || req.user.email || 'admin@eventpro.com';
    const organizer = value.organizer || req.user.name || 'Event Pro';

    const event = await Event.create({
      ...value,
      location: locationText,
      organizer,
      contactEmail,
      registrationDeadline: regDeadline,
      availableSlots: value.availableSlots !== undefined ? value.availableSlots : value.capacity,
      createdBy: req.user.userId,
      status: value.status || 'Published',
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Admin has full role access to update ANY event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event',
      });
    }

    const { error, value } = validateEvent(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!value.location) {
      value.location = [value.venue, value.area, value.district, value.state].filter(Boolean).join(', ');
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Admin has full role access to delete ANY event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Draft', 'Published', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event',
      });
    }

    event.status = status;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event status updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
