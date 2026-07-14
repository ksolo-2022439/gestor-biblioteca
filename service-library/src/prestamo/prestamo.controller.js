import mongoose from 'mongoose';
import Prestamo from './prestamo.model.js';
import Libro from '../libro/libro.model.js';

export const crearPrestamo = async (req, res) => {
  try {
    const {
      libro_id,
      nombre_prestatario,
      apellido_prestatario,
      dpi,
      contacto,
      fecha_retorno_limite
    } = req.body;
    const usuario_id = req.user.uid;

    if (!libro_id || !nombre_prestatario || !apellido_prestatario || !dpi || !contacto || !fecha_retorno_limite) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: libro_id, nombre_prestatario, apellido_prestatario, dpi, contacto, fecha_retorno_limite'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(libro_id)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID de libro inválido'
      });
    }

    const dpiRegex = /^\d{13}$/;
    if (!dpiRegex.test(dpi)) {
      return res.status(400).json({
        success: false,
        message: 'El DPI debe contener exactamente 13 dígitos numéricos'
      });
    }

    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phoneRegex.test(contacto) && !emailRegex.test(contacto)) {
      return res.status(400).json({
        success: false,
        message: 'El contacto debe ser un número de teléfono de 8 dígitos o un correo electrónico válido'
      });
    }

    const fechaLimite = new Date(fecha_retorno_limite);
    if (isNaN(fechaLimite.getTime()) || fechaLimite <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La fecha límite de retorno debe ser una fecha futura válida'
      });
    }

    const libro = await Libro.findById(libro_id);
    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    if (!libro.disponible) {
      return res.status(400).json({
        success: false,
        message: 'El libro no está disponible para préstamo'
      });
    }

    libro.disponible = false;
    libro.veces_prestado = (libro.veces_prestado || 0) + 1;
    await libro.save();

    const prestamo = new Prestamo({
      usuario_id,
      libro_id,
      nombre_prestatario,
      apellido_prestatario,
      dpi,
      contacto,
      fecha_prestamo: new Date(),
      fecha_retorno_limite: fechaLimite,
      estado: 'PRESTADO'
    });

    await prestamo.save();

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado exitosamente',
      data: prestamo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el préstamo',
      error: error.message
    });
  }
};

export const registrarDevolucion = async (req, res) => {
  try {
    const { libro_id } = req.body;
    const usuario_id = req.user.uid;

    if (!libro_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de libro es obligatorio'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(libro_id)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID de libro inválido'
      });
    }

    const prestamo = await Prestamo.findOne({
      libro_id,
      estado: 'PRESTADO'
    });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un préstamo activo para este libro'
      });
    }

    prestamo.estado = 'DEVUELTO';
    prestamo.fecha_devolucion = new Date();
    await prestamo.save();

    const libro = await Libro.findById(libro_id);
    if (libro) {
      libro.disponible = true;
      await libro.save();
    }

    res.status(200).json({
      success: true,
      message: 'Devolución registrada exitosamente',
      data: prestamo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar la devolución',
      error: error.message
    });
  }
};

export const getPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.find().populate('libro_id');
    res.status(200).json({
      success: true,
      data: prestamos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los préstamos',
      error: error.message
    });
  }
};
