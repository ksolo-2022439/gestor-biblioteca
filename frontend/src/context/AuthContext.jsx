import { createContext, useState, useEffect } from 'react';
import { apiAuth } from '../api/axios.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (correo, contrasena) => {
    setError(null);
    try {
      const response = await apiAuth.post('/usuario/login', { correo, contrasena });
      const { token: receivedToken, usuario } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(usuario));

      setToken(receivedToken);
      setUser(usuario);
      return true;
    } catch (err) {
      let msg = 'Error de conexión con el servidor';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.map(e => e.message).join('. ');
      }
      setError(msg);
      return false;
    }
  };

  const register = async (nombre, correo, contrasena, fecha_nacimiento) => {
    setError(null);
    try {
      const response = await apiAuth.post('/usuario/register', { nombre, correo, contrasena, fecha_nacimiento });
      const { token: receivedToken, usuario } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(usuario));

      setToken(receivedToken);
      setUser(usuario);
      return true;
    } catch (err) {
      let msg = 'Error al registrar el usuario';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.map(e => e.message).join('. ');
      }
      setError(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
