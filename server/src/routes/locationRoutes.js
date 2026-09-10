import express from 'express';
import {
  getLocationHierarchy,
  getStates,
  getDistricts,
  getAreas,
  createLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/hierarchy', getLocationHierarchy);
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/areas', getAreas);

router.post('/', authMiddleware, roleMiddleware(['admin']), createLocation);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteLocation);

export default router;
