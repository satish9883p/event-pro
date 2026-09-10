import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  deleteReview,
} from '../controllers/adminController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/reviews/:hallId/:reviewId', deleteReview);

export default router;
