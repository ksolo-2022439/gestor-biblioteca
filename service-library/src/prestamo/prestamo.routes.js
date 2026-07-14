import { Router } from 'express';
import { getPrestamos } from './prestamo.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/', validateJWT, getPrestamos);

export default router;
