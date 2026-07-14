import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiAuth } from '../api/axios.js';

const LoginPage = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(null);
  const { login, register, error, setError } = useContext(AuthContext);

  useEffect(() => {
    setError(null);
    setRecoverySuccess(null);
  }, [setError, isRegistering, isRecovering]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (correo && !emailRegex.test(correo)) {
      setError('Por favor, ingresa un correo electrónico válido (ej: usuario@kinal.edu.gt).');
      return;
    }

    if (isRecovering) {
      if (!correo || !nombre || !fechaNacimiento || !nuevaContrasena) {
        setError('Por favor, completa todos los campos.');
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await apiAuth.post('/usuario/recover-password', {
          correo,
          nombre,
          fecha_nacimiento: fechaNacimiento,
          nuevaContrasena
        });
        setRecoverySuccess(response.data.message);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al recuperar la contraseña');
        setRecoverySuccess(null);
      }
      setIsSubmitting(false);
      return;
    }

    if (isRegistering) {
      if (!nombre || !correo || !contrasena || !fechaNacimiento) {
        setError('Por favor, completa todos los campos.');
        return;
      }
      setIsSubmitting(true);
      await register(nombre, correo, contrasena, fechaNacimiento);
      setIsSubmitting(false);
    } else {
      if (!correo || !contrasena) {
        setError('Por favor, completa todos los campos.');
        return;
      }
      setIsSubmitting(true);
      await login(correo, contrasena);
      setIsSubmitting(false);
    }
  };

  const switchToLogin = () => {
    setIsRegistering(false);
    setIsRecovering(false);
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    setIsRecovering(false);
  };

  const switchToRecover = () => {
    setIsRecovering(true);
    setIsRegistering(false);
  };

  const getTitle = () => {
    if (isRecovering) return 'Recuperar Contraseña';
    if (isRegistering) return 'Crear Cuenta';
    return 'Iniciar Sesión';
  };

  const getSubtitle = () => {
    if (isRecovering) return 'Ingresa tus datos registrados para cambiar la contraseña';
    if (isRegistering) return 'Completa tus datos para registrarte';
    return 'Por favor ingresa tus datos de acceso';
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        <div className="login-card-left">
          <div className="logo-section">
            <span className="logo-icon" style={{ display: 'inline-flex', borderRadius: '1.25rem', padding: '0.25rem' }}>
              <img src="/logo.png" alt="Scriba Logo" style={{ width: '5.5rem', height: '5.5rem', objectFit: 'contain' }} />
            </span>
            <h1 style={{ marginTop: '1.25rem' }}>Scriba</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: '1.45rem', maxWidth: '280px' }}>
              Tu plataforma inteligente para la gestión de préstamos, catalogación y control de inventario de biblioteca.
            </p>
          </div>
          <div className="illustration-section">
            <p className="quote">"El aprendizaje no se detiene. Gestiona, aprende y avanza."</p>
          </div>
        </div>

        <div className="login-card-right">
          <div className="form-header">
            <h2>{getTitle()}</h2>
            <p className="subtitle">{getSubtitle()}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="alert-icon" style={{ display: 'inline-flex', color: 'var(--error)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ display: 'inline-flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <span>{recoverySuccess}</span>
              </div>
            )}

            {(isRegistering || isRecovering) && (
              <div className="input-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </span>
                  <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del administrador" required />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input type="text" id="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@kinal.edu.gt" required />
              </div>
            </div>

            {(isRegistering || isRecovering) && (
              <div className="input-group">
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    id="fechaNacimiento"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            )}

            {!isRecovering && (
              <div className="input-group">
                <label htmlFor="contrasena">Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 1 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>
                  </span>
                  <input type="password" id="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" required />
                </div>
              </div>
            )}

            {isRecovering && (
              <div className="input-group">
                <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </span>
                  <input type="password" id="nuevaContrasena" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                </div>
              </div>
            )}

            <button type="submit" className="btn-login" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="loader-container">
                  <div className="btn-loader"></div>
                  <span>Cargando...</span>
                </div>
              ) : (
                isRecovering ? 'Restablecer Contraseña' : isRegistering ? 'Registrarse' : 'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isRecovering ? (
              <button onClick={switchToLogin} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                Volver a Iniciar Sesión
              </button>
            ) : (
              <>
                <button onClick={isRegistering ? switchToLogin : switchToRegister} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
                </button>
                {!isRegistering && (
                  <button onClick={switchToRecover} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </>
            )}
          </div>

          <div className="form-footer" style={{ marginTop: '2rem' }}>
            <p>© 2026 6to Informática. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
