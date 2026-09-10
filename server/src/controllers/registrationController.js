import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

export const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a cancelled event',
      });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed',
      });
    }

    const registrationCount = await Registration.countDocuments({
      event: id,
      status: { $in: ['registered', 'attended'] },
    });

    if (registrationCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity',
      });
    }

    const existingRegistration = await Registration.findOne({
      user: req.user.userId,
      event: id,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    const registration = await Registration.create({
      user: req.user.userId,
      event: id,
      status: 'registered',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findOne({
      user: req.user.userId,
      event: id,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user.userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
      .populate('event')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ registrationDate: -1 });

    const total = await Registration.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: registrations,
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

export const getEventRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view registrations for this event',
      });
    }

    const filter = { event: id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
      .populate('user', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ registrationDate: -1 });

    const total = await Registration.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: registrations,
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
