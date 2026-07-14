import Prestamo from './prestamo.model.js';
import Libro from '../libro/libro.model.js';

export const crearPrestamo = async (req, res) => {
  try {
    const { libro_id } = req.body;
    const usuario_id = req.user.uid;

    if (!libro_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de libro es obligatorio'
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
      fecha_prestamo: new Date(),
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

    const prestamo = await Prestamo.findOne({
      usuario_id,
      libro_id,
      estado: 'PRESTADO'
    });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un préstamo activo para este libro y usuario'
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
