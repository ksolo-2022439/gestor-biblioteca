import { body } from 'express-validator';
import Usuario from '../src/usuario/usuario.model.js';
import { validateFields } from './validate-fields.js';

export const registerValidator = [
  body('nombre', 'El nombre es obligatorio y no puede estar vacío').not().isEmpty(),
  body('correo', 'El correo debe ser un email válido').isEmail(),
  body('correo').custom(async (correo) => {
    const usuarioExiste = await Usuario.findOne({ correo });
    if (usuarioExiste) {
      throw new Error('El correo ya está registrado');
    }
  }),
  body('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
];
