import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import argon2 from 'argon2';
import { dbConnection } from './db.js';
import usuarioRoutes from '../src/usuario/usuario.routes.js';
import Usuario from '../src/usuario/usuario.model.js';

const middlewares = (app) => {
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

const routes = (app) => {
  app.use('/api/v1/usuario', usuarioRoutes);

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

const seedUserDatabase = async () => {
  try {
    const count = await Usuario.countDocuments();
    if (count === 0) {
      const passwordHash = await argon2.hash('AdminPassword126');
      await Usuario.create({
        nombre: 'Administrador Maestro',
        correo: 'admin@kinal.edu.gt',
        contrasena: passwordHash,
        fecha_nacimiento: new Date('1990-01-01')
      });
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

export const initServer = async () => {
  const app = express();
  const port = process.env.PORT || 3001;

  await dbConnection();

  await seedUserDatabase();

  middlewares(app);

  routes(app);

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
  });
};
