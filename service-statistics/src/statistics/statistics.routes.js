import { Router } from 'express';
import { getStatistics, getCategories } from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/', validateJWT, getStatistics);
router.get('/categories', validateJWT, getCategories);

export default router;
