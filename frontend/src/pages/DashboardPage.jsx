import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiLibrary, apiStatistics } from '../api/axios.js';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [libros, setLibros] = useState([]);
  const [stats, setStats] = useState(null);
  const [categoriesStats, setCategoriesStats] = useState({});

  const [loadingLibros, setLoadingLibros] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorLibros, setErrorLibros] = useState(null);
  const [errorStats, setErrorStats] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingLibro, setEditingLibro] = useState(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formAutor, setFormAutor] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formAnio, setFormAnio] = useState('');

  const fetchLibros = async () => {
    try {
      setLoadingLibros(true);
      setErrorLibros(null);

      const params = {};
      if (searchTitle) params.titulo = searchTitle;
      if (searchAuthor) params.autor = searchAuthor;
      if (searchCategory) params.categoria = searchCategory;

      const response = await apiLibrary.get('/books', { params });
      setLibros(response.data.data);
    } catch (err) {
      setErrorLibros('No se pudo conectar con el Servicio de Biblioteca.');
    } finally {
      setLoadingLibros(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const responseStats = await apiStatistics.get('/statistics');
      setStats(responseStats.data.data);

      const responseCategories = await apiStatistics.get('/statistics/categories');
      setCategoriesStats(responseCategories.data.data);
    } catch (err) {
      setErrorStats('No se pudo conectar con el Servicio de Estadísticas.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLibros();
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLibros();
  };

  const handleClearSearch = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchCategory('');
    setLoadingLibros(true);
    apiLibrary.get('/books')
      .then(response => {
        setLibros(response.data.data);
        setLoadingLibros(false);
      })
      .catch(() => {
        setErrorLibros('No se pudo conectar con el Servicio de Biblioteca.');
        setLoadingLibros(false);
      });
  };

  const openAddModal = () => {
    setEditingLibro(null);
    setFormTitulo('');
    setFormAutor('');
    setFormCategoria('');
    setFormAnio('');
    setShowModal(true);
  };

  const openEditModal = (libro) => {
    setEditingLibro(libro);
    setFormTitulo(libro.titulo);
    setFormAutor(libro.autor);
    setFormCategoria(libro.categoria);
    setFormAnio(libro.anio || '');
    setShowModal(true);
  };

  const handleSaveLibro = async (e) => {
    e.preventDefault();
    if (!formTitulo || !formAutor || !formCategoria) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      const payload = {
        titulo: formTitulo,
        autor: formAutor,
        categoria: formCategoria,
        anio: formAnio ? parseInt(formAnio) : undefined
      };

      if (editingLibro) {
        await apiLibrary.put(`/books/${editingLibro._id}`, payload);
      } else {
        await apiLibrary.post('/books', payload);
      }

      setShowModal(false);
      fetchLibros();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el libro');
    }
  };

  const handleDeleteLibro = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este libro?')) return;
    try {
      await apiLibrary.delete(`/books/${id}`);
      fetchLibros();
      fetchStats();
    } catch (err) {
      alert('Error al eliminar el libro');
    }
  };

  const handleLoanBook = async (libroId) => {
    try {
      await apiLibrary.post('/loans', { libro_id: libroId });
      fetchLibros();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al realizar el préstamo');
    }
  };

  const handleReturnBook = async (libroId) => {
    try {
      await apiLibrary.post('/returns', { libro_id: libroId });
      fetchLibros();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al realizar la devolución');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Panel de Control</h1>
          <p className="welcome-msg">Bienvenido de nuevo, {user?.nombre || 'Usuario'}</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-login" style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={openAddModal}>
            ➕ Registrar Libro
          </button>
          <button className="btn-refresh" onClick={() => { fetchLibros(); fetchStats(); }}>
            🔄 Actualizar
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
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <h3>Total Préstamos</h3>
                <p className="stat-value">{stats.totalPrestamos}</p>
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Préstamos Activos</h3>
                <p className="stat-value">{stats.prestamosActivos}</p>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Más Solicitado</h3>
                <p className="stat-title-highlight">
                  {stats.masPrestado ? stats.masPrestado.titulo : 'Ninguno'}
                </p>
                <span className="stat-subtitle">
                  {stats.masPrestado ? `${stats.masPrestado.veces_prestado} préstamos` : '0 préstamos'}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {categoriesStats && Object.keys(categoriesStats).length > 0 && (
        <section className="stats-section" style={{ marginTop: '-1rem' }}>
          <h3 className="section-title">Distribución por Categorías</h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(categoriesStats).map(([cat, count]) => (
              <div className="stat-card" key={cat} style={{ padding: '1rem', gap: '0.75rem', borderLeft: '4px solid var(--text-muted)' }}>
                <div style={{ fontSize: '1.25rem' }}>🏷️</div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat}</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{count} libros</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="catalog-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Filtrar Catálogo</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '180px' }}>
              <label>Título</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Ej: Quijote"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '180px' }}>
              <label>Autor</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                  placeholder="Ej: Cervantes"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '180px' }}>
              <label>Categoría</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="Ej: Novela"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-login" style={{ marginTop: 0, padding: '0.675rem 1.25rem', whiteSpace: 'nowrap' }}>
                🔍 Buscar
              </button>
              <button type="button" className="btn-refresh" onClick={handleClearSearch} style={{ padding: '0.675rem 1.25rem' }}>
                Limpiar
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Catálogo de Libros (Servicio Biblioteca)</h2>
        </div>

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
                    <th className="text-center">Veces Prestado</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {libros.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-row">
                        No se encontraron libros en el catálogo con los filtros aplicados.
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
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            {libro.disponible ? (
                              <button
                                className="btn-refresh"
                                style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.25rem 0.50rem' }}
                                onClick={() => handleLoanBook(libro._id)}
                              >
                                Solicitar Préstamo
                              </button>
                            ) : (
                              <button
                                className="btn-refresh"
                                style={{ borderColor: 'var(--warning)', color: 'var(--warning)', padding: '0.25rem 0.50rem' }}
                                onClick={() => handleReturnBook(libro._id)}
                              >
                                Devolver Libro
                              </button>
                            )}
                            <button
                              className="btn-refresh"
                              style={{ padding: '0.25rem 0.50rem' }}
                              onClick={() => openEditModal(libro)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-logout"
                              style={{ padding: '0.25rem 0.50rem' }}
                              onClick={() => handleDeleteLibro(libro._id)}
                            >
                              Eliminar
                            </button>
                          </div>
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

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              {editingLibro ? 'Editar Libro' : 'Registrar Nuevo Libro'}
            </h3>
            <form onSubmit={handleSaveLibro} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label>Título *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ingrese el título"
                    required
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Autor *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={formAutor}
                    onChange={(e) => setFormAutor(e.target.value)}
                    placeholder="Ingrese el autor"
                    required
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Categoría *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    placeholder="Ingrese la categoría (Ej: Novela, Ciencia)"
                    required
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Año de Publicación</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={formAnio}
                    onChange={(e) => setFormAnio(e.target.value)}
                    placeholder="Ej: 1980"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-refresh" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-login" style={{ marginTop: 0, padding: '0.5rem 1.5rem' }}>
                  Guardar Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
