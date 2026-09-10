import express from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
} from '../controllers/registrationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id/register', authMiddleware, registerForEvent);
router.delete('/:id/register', authMiddleware, cancelRegistration);
router.get('/my', authMiddleware, getMyRegistrations);
router.get('/:id/registrations', authMiddleware, roleMiddleware(['admin']), getEventRegistrations);

export default router;
