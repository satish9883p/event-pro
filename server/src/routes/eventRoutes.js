import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} from '../controllers/eventController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authMiddleware, roleMiddleware(['admin']), createEvent);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteEvent);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin']), updateEventStatus);

export default router;
