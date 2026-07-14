import { Router } from 'express';
import {
  getStatistics,
  getCategories,
  getRecommendations,
  getSummary
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/', validateJWT, getStatistics);
router.get('/categories', validateJWT, getCategories);
router.get('/recommendations/:category', validateJWT, getRecommendations);
router.get('/summary', validateJWT, getSummary);

export default router;
