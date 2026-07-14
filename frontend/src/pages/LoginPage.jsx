import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, setError } = useContext(AuthContext);

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(correo, contrasena);
    setIsSubmitting(false);

    if (success) {
      console.log('Login successful');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        <div className="login-card-left">
          <div className="logo-section">
            <span className="logo-icon">📚</span>
            <h1>Biblioteca Kinal</h1>
            <p>Evaluación de Desarrollo Ágil — Sprint 1</p>
          </div>
          <div className="illustration-section">
            <p className="quote">"El aprendizaje no se detiene. Gestiona, aprende y avanza."</p>
          </div>
        </div>

        <div className="login-card-right">
          <div className="form-header">
            <h2>Iniciar Sesión</h2>
            <p className="subtitle">Por favor ingresa tus datos de acceso</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@kinal.edu.gt"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contrasena">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type="password"
                  id="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="loader-container">
                  <div className="btn-loader"></div>
                  <span>Cargando...</span>
                </div>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>© 2026 6to Informática. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
