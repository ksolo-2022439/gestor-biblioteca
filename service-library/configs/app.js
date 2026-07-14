import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import libroRoutes from '../src/libro/libro.routes.js';
import prestamoRoutes from '../src/prestamo/prestamo.routes.js';
import Libro from '../src/libro/libro.model.js';

const middlewares = (app) => {
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

const routes = (app) => {
  app.use('/api/v1/libro', libroRoutes);
  app.use('/api/v1/prestamo', prestamoRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.errors || null
  });
};

const seedDatabase = async () => {
  try {
    const count = await Libro.countDocuments();
    if (count === 0) {
      console.log('Seeding database with default books...');
      await Libro.create([
        {
          titulo: 'Cien años de soledad',
          autor: 'Gabriel García Márquez',
          categoria: 'Novela',
          anio: 1967,
          disponible: true,
          veces_prestado: 12
        },
        {
          titulo: 'Don Quijote de la Mancha',
          autor: 'Miguel de Cervantes',
          categoria: 'Novela',
          anio: 1605,
          disponible: false,
          veces_prestado: 25
        },
        {
          titulo: 'El principito',
          autor: 'Antoine de Saint-Exupéry',
          categoria: 'Infantil',
          anio: 1943,
          disponible: true,
          veces_prestado: 18
        },
        {
          titulo: 'Breve historia del tiempo',
          autor: 'Stephen Hawking',
          categoria: 'Ciencia',
          anio: 1988,
          disponible: true,
          veces_prestado: 5
        }
      ]);
      console.log('Database seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export const initServer = async () => {
  const app = express();
  const port = process.env.PORT || 3002;

  await dbConnection();

  await seedDatabase();

  middlewares(app);

  routes(app);

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Library Service running on port ${port}`);
  });
};
