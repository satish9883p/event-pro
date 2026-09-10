import Venue from '../models/Venue.js';
import VenueBooking from '../models/VenueBooking.js';

export const createVenue = async (req, res, next) => {
  try {
    const payload = req.body;
    const ownerId = req.user?.role === 'admin' ? payload.ownerId || req.user.userId : req.user.userId;

    const venue = await Venue.create({
      ...payload,
      ownerId,
      approvalStatus: 'PENDING',
      images: Array.isArray(payload.images) ? payload.images : [payload.image].filter(Boolean),
      amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
      availability: Array.isArray(payload.availability) ? payload.availability : [],
    });

    res.status(201).json({ success: true, data: venue, message: 'Venue submitted for approval' });
  } catch (error) {
    next(error);
  }
};

export const getVenues = async (req, res, next) => {
  try {
    const { city, state, district, area, search } = req.query;
    const filter = { approvalStatus: 'APPROVED', $and: [] };
    if (city) filter.$and.push({ $or: [{ city: { $regex: city, $options: 'i' } }, { address: { $regex: city, $options: 'i' } }] });
    if (state) filter.$and.push({ $or: [{ state: { $regex: state, $options: 'i' } }, { address: { $regex: state, $options: 'i' } }] });
    if (district) filter.$and.push({ $or: [{ district: { $regex: district, $options: 'i' } }, { address: { $regex: district, $options: 'i' } }] });
    if (area) filter.$and.push({ $or: [{ area: { $regex: area, $options: 'i' } }, { address: { $regex: area, $options: 'i' } }] });
    if (search) {
      filter.$and.push({ $or: [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { venueType: { $regex: search, $options: 'i' } },
      ] });
    }
    const venues = await Venue.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
};

export const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    const canView = venue.approvalStatus === 'APPROVED' || req.user?.role === 'admin' || venue.ownerId.toString() === req.user?.userId;
    if (!canView) {
      return res.status(403).json({ success: false, message: 'Venue is not public yet' });
    }
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
};

export const getMyVenues = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user.userId };
    const venues = await Venue.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
};

export const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (req.user.role !== 'admin' && venue.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own venues' });
    }

    const allowedFields = [
      'name', 'description', 'venueType', 'address', 'city', 'state', 'pincode',
      'latitude', 'longitude', 'googleMapUrl', 'contactName', 'contactPhone',
      'contactEmail', 'images', 'capacity', 'amenities', 'price', 'availability',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) venue[field] = req.body[field];
    });

    if (venue.approvalStatus === 'APPROVED' && req.user.role !== 'admin') {
      venue.approvalStatus = 'PENDING';
    }

    await venue.save();
    res.status(200).json({ success: true, message: 'Venue updated and sent for review', data: venue });
  } catch (error) {
    next(error);
  }
};

export const updateVenueStatus = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    venue.approvalStatus = approvalStatus;
    await venue.save();
    res.status(200).json({ success: true, message: 'Venue status updated', data: venue });
  } catch (error) {
    next(error);
  }
};

export const addBookingRequest = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    if (venue.approvalStatus !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only approved venues can accept booking requests' });
    }

    const payload = req.body;
    const bookingDate = new Date(payload.bookingDate);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Valid booking date is required' });
    }

    const conflicting = await VenueBooking.findOne({
      venueId: venue._id,
      bookingDate,
      status: { $in: ['PENDING', 'ACCEPTED'] },
      $or: [
        { startTime: { $lte: payload.startTime }, endTime: { $gte: payload.startTime } },
        { startTime: { $lte: payload.endTime }, endTime: { $gte: payload.endTime } },
      ],
    });

    if (conflicting) {
      return res.status(400).json({ success: false, message: 'This time slot is already requested or accepted for the venue' });
    }

    const booking = await VenueBooking.create({
      userId: req.user.userId,
      venueId: venue._id,
      bookingDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      numberOfPeople: payload.numberOfPeople || 1,
      purpose: payload.purpose || '',
      notes: payload.notes || '',
      contactName: payload.contactName || req.user.name || '',
      contactPhone: payload.contactPhone || '',
      contactEmail: payload.contactEmail || req.user.email || '',
      status: 'PENDING',
    });

    res.status(201).json({ success: true, message: 'Booking request submitted successfully', data: booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookingRequests = async (req, res, next) => {
  try {
    const bookings = await VenueBooking.find({ userId: req.user.userId }).populate('venueId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookingRequests = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user.userId };
    const venues = await Venue.find(filter).select('_id name');
    const venueIds = venues.map((venue) => venue._id);
    const bookings = await VenueBooking.find({ venueId: { $in: venueIds } }).populate('userId', 'name email phone').populate('venueId', 'name city state').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await VenueBooking.findById(req.params.id).populate('venueId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (req.user.role !== 'admin' && booking.venueId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You cannot manage this booking request' });
    }

    if (!['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    if (status === 'ACCEPTED') {
      const conflict = await VenueBooking.findOne({
        _id: { $ne: booking._id },
        venueId: booking.venueId._id,
        bookingDate: booking.bookingDate,
        status: 'ACCEPTED',
        $or: [
          { startTime: { $lte: booking.startTime }, endTime: { $gte: booking.startTime } },
          { startTime: { $lte: booking.endTime }, endTime: { $gte: booking.endTime } },
        ],
      });

      if (conflict) {
        return res.status(400).json({ success: false, message: 'This slot is already accepted for another booking request' });
      }
    }

    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking status updated', data: booking });
  } catch (error) {
    next(error);
  }
};
