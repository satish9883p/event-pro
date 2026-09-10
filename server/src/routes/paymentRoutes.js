import express from 'express';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a Razorpay order for an existing booking (user must be logged in)
router.post('/create-order', authMiddleware, createOrder);

// Verify payment after Razorpay checkout completes (user must be logged in)
router.post('/verify', authMiddleware, verifyPayment);

// Razorpay webhook — no auth (verified by signature), uses rawBody
router.post('/webhook', handleWebhook);

export default router;
