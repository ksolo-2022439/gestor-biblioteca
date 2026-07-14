import jwt from 'jsonwebtoken';

export const generateJWT = (uid = '', nombre = '') => {
  return new Promise((resolve, reject) => {
    const payload = { uid, nombre };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return reject(new Error('JWT_SECRET is not defined in environment variables'));
    }

    jwt.sign(
      payload,
      secret,
      {
        expiresIn: '4h'
      },
      (err, token) => {
        if (err) {
          console.error(err);
          reject(new Error('Could not generate token'));
        } else {
          resolve(token);
        }
      }
    );
  });
};
