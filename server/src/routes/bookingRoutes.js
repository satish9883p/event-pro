import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/all', authMiddleware, roleMiddleware(['admin']), getAllBookings);
router.get('/:id', authMiddleware, getBookingById);
router.patch('/:id/cancel', authMiddleware, cancelBooking);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin']), updateBookingStatus);

export default router;
