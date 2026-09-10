import express from 'express';
import {
  getFunctionHalls,
  getFunctionHallById,
  createFunctionHall,
  updateFunctionHall,
  deleteFunctionHall,
  addHallReview,
  checkHallSlotAvailability,
} from '../controllers/functionHallController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getFunctionHalls);
router.get('/:id', getFunctionHallById);
router.get('/:id/check-slot', checkHallSlotAvailability);

router.post('/', authMiddleware, roleMiddleware(['admin']), createFunctionHall);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateFunctionHall);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteFunctionHall);

router.post('/:id/reviews', authMiddleware, addHallReview);

export default router;
