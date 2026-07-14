import { Router } from 'express';
import { getResumen } from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/resumen', validateJWT, getResumen);

export default router;
