import express from 'express';
import {
  createVenue,
  getVenues,
  getVenueById,
  getMyVenues,
  updateVenue,
  updateVenueStatus,
  addBookingRequest,
  getMyBookingRequests,
  getOwnerBookingRequests,
  updateBookingRequestStatus,
} from '../controllers/venueController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVenues);
router.get('/my', authMiddleware, roleMiddleware(['venue_owner', 'admin']), getMyVenues);
router.get('/my-bookings', authMiddleware, roleMiddleware(['user']), getMyBookingRequests);
router.get('/owner-bookings', authMiddleware, roleMiddleware(['venue_owner', 'admin']), getOwnerBookingRequests);
router.get('/:id', authMiddleware, getVenueById);
router.post('/', authMiddleware, roleMiddleware(['venue_owner', 'admin']), createVenue);
router.put('/:id', authMiddleware, roleMiddleware(['venue_owner', 'admin']), updateVenue);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin']), updateVenueStatus);
router.post('/:id/booking-requests', authMiddleware, roleMiddleware(['user']), addBookingRequest);
router.patch('/booking-requests/:id/status', authMiddleware, roleMiddleware(['venue_owner', 'admin']), updateBookingRequestStatus);

export default router;
