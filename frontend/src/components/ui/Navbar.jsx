import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Gestor de Biblioteca</span>
        </div>
        <div className="navbar-user">
          <span className="user-greeting">
            Hola, <strong className="user-name">{user.nombre}</strong>
          </span>
          <button className="btn-logout" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};
