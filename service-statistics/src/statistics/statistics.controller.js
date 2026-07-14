import { getLibraryClient } from '../../utils/library-client.js';

export const getStatistics = async (req, res) => {
  try {
    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');
    const libraryClient = getLibraryClient(token);

    const booksResponse = await libraryClient.get('/books');
    const libros = booksResponse.data.data;

    const loansResponse = await libraryClient.get('/loans');
    const prestamos = loansResponse.data.data;

    const totalLibros = libros.length;
    const totalPrestamos = prestamos.length;
    const prestamosActivos = prestamos.filter(p => p.estado === 'PRESTADO').length;

    let masPrestado = null;
    libros.forEach((libro) => {
      if (!masPrestado || (libro.veces_prestado || 0) > (masPrestado.veces_prestado || 0)) {
        masPrestado = libro;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLibros,
        totalPrestamos,
        prestamosActivos,
        masPrestado: masPrestado ? {
          titulo: masPrestado.titulo,
          autor: masPrestado.autor,
          veces_prestado: masPrestado.veces_prestado || 0
        } : null
      }
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al generar estadísticas generales',
      error: error.response?.data?.message || error.message
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');
    const libraryClient = getLibraryClient(token);

    const booksResponse = await libraryClient.get('/books');
    const libros = booksResponse.data.data;

    const categorias = {};
    libros.forEach((libro) => {
      const cat = libro.categoria || 'Sin Categoría';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: categorias
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al obtener estadísticas de categorías',
      error: error.response?.data?.message || error.message
    });
  }
};
