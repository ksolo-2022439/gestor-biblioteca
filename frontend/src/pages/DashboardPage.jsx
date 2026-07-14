import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiLibrary, apiStatistics } from '../api/axios.js';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [libros, setLibros] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingLibros, setLoadingLibros] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorLibros, setErrorLibros] = useState(null);
  const [errorStats, setErrorStats] = useState(null);

  const fetchLibros = async () => {
    try {
      setLoadingLibros(true);
      setErrorLibros(null);
      const response = await apiLibrary.get('/libro');
      setLibros(response.data.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setErrorLibros('No se pudo conectar con el Servicio de Biblioteca.');
    } finally {
      setLoadingLibros(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const response = await apiStatistics.get('/statistics/resumen');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setErrorStats('No se pudo conectar con el Servicio de Estadísticas.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLibros();
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Panel de Control</h1>
          <p className="welcome-msg">Bienvenido de nuevo, {user?.nombre || 'Usuario'}</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={() => { fetchLibros(); fetchStats(); }}>
            🔄 Actualizar Datos
          </button>
        </div>
      </header>

      <section className="stats-section">
        <h2 className="section-title">Resumen de Biblioteca (Servicio Estadísticas)</h2>
        {loadingStats ? (
          <div className="stats-loader">
            <div className="btn-loader"></div>
            <span>Calculando estadísticas...</span>
          </div>
        ) : errorStats ? (
          <div className="alert alert-warning">
            <span>⚠️ {errorStats}</span>
          </div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>Total Libros</h3>
                <p className="stat-value">{stats.totalLibros}</p>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Disponibles</h3>
                <p className="stat-value">{stats.disponibles}</p>
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Prestados</h3>
                <p className="stat-value">{stats.noDisponibles}</p>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Libro Más Solicitado</h3>
                <p className="stat-title-highlight">
                  {stats.masPrestado ? stats.masPrestado.titulo : 'N/A'}
                </p>
                <span className="stat-subtitle">
                  {stats.masPrestado ? `${stats.masPrestado.veces_prestado} solicitudes` : ''}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="catalog-section">
        <h2 className="section-title">Catálogo de Libros (Servicio Biblioteca)</h2>
        {loadingLibros ? (
          <div className="catalog-loader">
            <div className="spinner"></div>
            <span>Cargando catálogo de libros...</span>
          </div>
        ) : errorLibros ? (
          <div className="alert alert-error">
            <span>⚠️ {errorLibros}</span>
          </div>
        ) : (
          <div className="table-card">
            <div className="table-wrapper">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categoría</th>
                    <th>Año</th>
                    <th>Veces Prestado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {libros.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No hay libros registrados en el catálogo.
                      </td>
                    </tr>
                  ) : (
                    libros.map((libro) => (
                      <tr key={libro._id}>
                        <td>
                          <div className="libro-title-cell">
                            <span className="book-emoji">📖</span>
                            <span className="book-title">{libro.titulo}</span>
                          </div>
                        </td>
                        <td>{libro.autor}</td>
                        <td>
                          <span className="badge category-badge">{libro.categoria}</span>
                        </td>
                        <td>{libro.anio || 'N/A'}</td>
                        <td className="text-center">{libro.veces_prestado || 0}</td>
                        <td>
                          <span className={`badge status-badge ${libro.disponible ? 'disponible' : 'prestado'}`}>
                            {libro.disponible ? 'Disponible' : 'Prestado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
