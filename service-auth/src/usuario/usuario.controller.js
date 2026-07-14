import argon2 from 'argon2';
import Usuario from './usuario.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    const passwordHash = await argon2.hash(contrasena);

    const usuario = new Usuario({
      nombre,
      correo,
      contrasena: passwordHash
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
    console.error('Registration error:', error);
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};
