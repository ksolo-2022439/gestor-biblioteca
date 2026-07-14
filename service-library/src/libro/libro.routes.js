import { Router } from 'express';
import {
  createLibro,
  getLibros,
  getLibroById,
  updateLibro,
  deleteLibro
} from './libro.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.get('/', validateJWT, getLibros);
router.get('/:id', validateJWT, getLibroById);
router.post('/', validateJWT, createLibro);
router.put('/:id', validateJWT, updateLibro);
router.delete('/:id', validateJWT, deleteLibro);

export default router;
