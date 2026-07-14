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
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Error de conexión con el servidor';
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
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
