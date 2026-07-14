import Libro from './libro.model.js';

export const createLibro = async (req, res) => {
  try {
    const { titulo, autor, categoria, anio } = req.body;

    if (!titulo || !autor || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Título, autor y categoría son obligatorios'
      });
    }

    const libro = new Libro({
      titulo,
      autor,
      categoria,
      anio,
      disponible: true,
      veces_prestado: 0
    });

    await libro.save();

    res.status(201).json({
      success: true,
      message: 'Libro registrado exitosamente',
      data: libro
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el libro',
      error: error.message
    });
  }
};

export const getLibros = async (req, res) => {
  try {
    const { titulo, autor, categoria } = req.query;
    const filter = {};

    if (titulo) {
      filter.titulo = { $regex: titulo, $options: 'i' };
    }
    if (autor) {
      filter.autor = { $regex: autor, $options: 'i' };
    }
    if (categoria) {
      filter.categoria = { $regex: categoria, $options: 'i' };
    }

    const libros = await Libro.find(filter);

    res.status(200).json({
      success: true,
      data: libros
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los libros',
      error: error.message
    });
  }
};

export const getLibroById = async (req, res) => {
  try {
    const { id } = req.params;
    const libro = await Libro.findById(id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: libro
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el libro',
      error: error.message
    });
  }
};

export const updateLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, categoria, anio, disponible } = req.body;

    const libro = await Libro.findById(id);
    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    if (titulo !== undefined) libro.titulo = titulo;
    if (autor !== undefined) libro.autor = autor;
    if (categoria !== undefined) libro.categoria = categoria;
    if (anio !== undefined) libro.anio = anio;
    if (disponible !== undefined) libro.disponible = disponible;

    await libro.save();

    res.status(200).json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: libro
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el libro',
      error: error.message
    });
  }
};

export const deleteLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const libro = await Libro.findByIdAndDelete(id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Libro eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el libro',
      error: error.message
    });
  }
};
