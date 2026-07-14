import { getLibraryClient } from '../../utils/library-client.js';

export const getResumen = async (req, res) => {
  try {
    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');
    const libraryClient = getLibraryClient(token);

    const response = await libraryClient.get('/libro');
    const libros = response.data.data;

    const totalLibros = libros.length;
    let disponibles = 0;
    let noDisponibles = 0;
    const categorias = {};
    let masPrestado = null;

    libros.forEach((libro) => {
      if (libro.disponible) {
        disponibles++;
      } else {
        noDisponibles++;
      }

      const cat = libro.categoria || 'Sin Categoría';
      categorias[cat] = (categorias[cat] || 0) + 1;

      if (!masPrestado || (libro.veces_prestado || 0) > (masPrestado.veces_prestado || 0)) {
        masPrestado = libro;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLibros,
        disponibles,
        noDisponibles,
        categorias,
        masPrestado: masPrestado ? {
          titulo: masPrestado.titulo,
          autor: masPrestado.autor,
          veces_prestado: masPrestado.veces_prestado || 0
        } : null
      }
    });
  } catch (error) {
    console.error('Error in statistics service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al generar el resumen de estadísticas',
      error: error.response?.data?.message || error.message
    });
  }
};
