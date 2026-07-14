import { Router } from 'express';
import { getLibros } from './libro.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/', validateJWT, getLibros);

export default router;
