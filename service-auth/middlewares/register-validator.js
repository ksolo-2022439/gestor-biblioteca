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
  body('fecha_nacimiento')
    .not().isEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('La fecha de nacimiento debe tener un formato de fecha válido')
    .custom((val) => {
      const fechaIngresada = new Date(val);
      const hoy = new Date();
      if (fechaIngresada >= hoy) {
        throw new Error('La fecha de nacimiento debe ser una fecha anterior al día de hoy');
      }
      return true;
    }),
  validateFields
];
