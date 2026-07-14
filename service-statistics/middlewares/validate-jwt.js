import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {
  const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado - No se proporcionó un token'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token no válido'
    });
  }
};
