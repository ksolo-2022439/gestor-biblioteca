import { Router } from 'express';
import { register, login } from './usuario.controller.js';
import { registerValidator } from '../../middlewares/register-validator.js';
import { loginValidator } from '../../middlewares/login-validator.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

export default router;
