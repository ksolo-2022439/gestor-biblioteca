import Libro from './libro.model.js';

export const getLibros = async (req, res) => {
  try {
    const libros = await Libro.find();
    res.status(200).json({
      success: true,
      data: libros
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los libros',
      error: error.message
    });
  }
};
