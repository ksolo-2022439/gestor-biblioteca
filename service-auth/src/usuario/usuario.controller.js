import argon2 from 'argon2';
import Usuario from './usuario.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena, fecha_nacimiento } = req.body;

    if (!nombre || !correo || !contrasena || !fecha_nacimiento) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    const passwordHash = await argon2.hash(contrasena);

    const usuario = new Usuario({
      nombre,
      correo,
      contrasena: passwordHash,
      fecha_nacimiento: new Date(fecha_nacimiento)
    });

    await usuario.save();

    const token = await generateJWT(usuario._id, usuario.nombre);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas - correo no encontrado'
      });
    }

    const isPasswordValid = await argon2.verify(usuario.contrasena, contrasena);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas - contraseña incorrecta'
      });
    }

    const token = await generateJWT(usuario._id, usuario.nombre);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión correcto',
      usuario,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

export const recoverPassword = async (req, res) => {
  try {
    const { correo, nombre, fecha_nacimiento, nuevaContrasena } = req.body;

    if (!correo || !nombre || !fecha_nacimiento || !nuevaContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: correo, nombre, fecha_nacimiento, nuevaContrasena'
      });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un usuario con ese correo electrónico'
      });
    }

    const d1 = new Date(usuario.fecha_nacimiento).toISOString().slice(0, 10);
    const d2 = new Date(fecha_nacimiento).toISOString().slice(0, 10);

    if (d1 !== d2 || usuario.nombre.toLowerCase() !== nombre.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'La información de seguridad (nombre o fecha de nacimiento) no coincide'
      });
    }

    usuario.contrasena = await argon2.hash(nuevaContrasena);
    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al recuperar la contraseña',
      error: error.message
    });
  }
};
