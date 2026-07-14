import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import usuarioRoutes from '../src/usuario/usuario.routes.js';

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

export const initServer = async () => {
  const app = express();
  const port = process.env.PORT || 3001;

  await dbConnection();

  middlewares(app);

  routes(app);

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
  });
};
