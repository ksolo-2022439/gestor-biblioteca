import { Router } from 'express';
import {
  crearPrestamo,
  registrarDevolucion,
  getPrestamos
} from './prestamo.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.post('/loans', validateJWT, crearPrestamo);
router.post('/returns', validateJWT, registrarDevolucion);
router.get('/loans', validateJWT, getPrestamos);

export default router;
