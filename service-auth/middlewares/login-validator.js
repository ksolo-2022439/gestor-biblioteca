import { body } from 'express-validator';
import { validateFields } from './validate-fields.js';

export const loginValidator = [
  body('correo', 'El correo debe ser un email válido').isEmail(),
  body('contrasena', 'La contraseña es obligatoria').not().isEmpty(),
  validateFields
];
