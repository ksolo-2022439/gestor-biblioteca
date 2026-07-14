import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiLibrary, apiStatistics } from '../api/axios.js';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [libros, setLibros] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categoriesStats, setCategoriesStats] = useState({});

  const [loadingLibros, setLoadingLibros] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorLibros, setErrorLibros] = useState(null);
  const [errorStats, setErrorStats] = useState(null);
  const [errorSummary, setErrorSummary] = useState(null);

  const [activeTab, setActiveTab] = useState('resumen');

  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const [recCategory, setRecCategory] = useState('Novela');
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingLibro, setEditingLibro] = useState(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formAutor, setFormAutor] = useState('');
  const [formCategoria, setFormCategoria] = useState('Novela');
  const [formAnio, setFormAnio] = useState('');

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanBookId, setLoanBookId] = useState(null);
  const [loanBookTitle, setLoanBookTitle] = useState('');
  const [loanNombre, setLoanNombre] = useState('');
  const [loanApellido, setLoanApellido] = useState('');
  const [loanDpi, setLoanDpi] = useState('');
  const [loanContacto, setLoanContacto] = useState('');
  const [loanPlazo, setLoanPlazo] = useState('7');
  const [loanFechaRetorno, setLoanFechaRetorno] = useState('');
  const [loanSubmitting, setLoanSubmitting] = useState(false);
  const [loanError, setLoanError] = useState(null);

  const [showBorrowerModal, setShowBorrowerModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedBorrowerBook, setSelectedBorrowerBook] = useState('');

  const categoriasPredefinidas = [
    'Novela',
    'Infantil',
    'Ciencia',
    'Historia',
    'Fantasía',
    'Poesía',
    'Biografía',
    'Drama'
  ];

  const plazosPreestablecidos = [
    { label: '3 días', value: '3' },
    { label: '7 días (1 semana)', value: '7' },
    { label: '14 días (2 semanas)', value: '14' },
    { label: '30 días (1 mes)', value: '30' },
    { label: '60 días (2 meses)', value: '60' },
    { label: 'Personalizado', value: 'custom' }
  ];

  const calcularFechaRetorno = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + parseInt(dias));
    return fecha.toISOString().slice(0, 16);
  };

  const handlePlazoChange = (valor) => {
    setLoanPlazo(valor);
    if (valor !== 'custom') {
      setLoanFechaRetorno(calcularFechaRetorno(valor));
    }
  };

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

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      setErrorSummary(null);
      const response = await apiStatistics.get('/statistics/summary');
      setSummary(response.data.data);
    } catch (err) {
      setErrorSummary('No se pudo obtener el resumen.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchLibros();
    fetchStats();
    fetchSummary();
  }, []);

  const refreshAll = () => { fetchLibros(); fetchStats(); fetchSummary(); };

  const handleSearch = (e) => { e.preventDefault(); fetchLibros(); };

  const handleClearSearch = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchCategory('');
    setLoadingLibros(true);
    apiLibrary.get('/books')
      .then(r => { setLibros(r.data.data); setLoadingLibros(false); })
      .catch(() => { setErrorLibros('Error de conexión.'); setLoadingLibros(false); });
  };

  const handleFetchRecommendations = async (e) => {
    e.preventDefault();
    if (!recCategory) return;
    try {
      setLoadingRecs(true);
      setErrorRecs(null);
      const response = await apiStatistics.get(`/statistics/recommendations/${encodeURIComponent(recCategory)}`);
      setRecommendedBooks(response.data.data);
    } catch (err) {
      setErrorRecs('Error al obtener recomendaciones.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const openAddModal = () => {
    setEditingLibro(null);
    setFormTitulo(''); setFormAutor(''); setFormCategoria('Novela'); setFormAnio('');
    setShowModal(true);
  };

  const openEditModal = (libro) => {
    setEditingLibro(libro);
    setFormTitulo(libro.titulo); setFormAutor(libro.autor);
    setFormCategoria(libro.categoria || 'Novela'); setFormAnio(libro.anio || '');
    setShowModal(true);
  };

  const handleSaveLibro = async (e) => {
    e.preventDefault();
    if (!formTitulo || !formAutor || !formCategoria) { alert('Complete los campos obligatorios'); return; }
    try {
      const payload = { titulo: formTitulo, autor: formAutor, categoria: formCategoria, anio: formAnio ? parseInt(formAnio) : undefined };
      if (editingLibro) { await apiLibrary.put(`/books/${editingLibro._id}`, payload); }
      else { await apiLibrary.post('/books', payload); }
      setShowModal(false);
      refreshAll();
    } catch (err) { alert(err.response?.data?.message || 'Error al guardar'); }
  };

  const handleDeleteLibro = async (id) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    try { await apiLibrary.delete(`/books/${id}`); refreshAll(); }
    catch (err) { alert('Error al eliminar'); }
  };

  const openLoanModal = (libro) => {
    setLoanBookId(libro._id);
    setLoanBookTitle(libro.titulo);
    setLoanNombre(''); setLoanApellido(''); setLoanDpi(''); setLoanContacto('');
    setLoanPlazo('7');
    setLoanFechaRetorno(calcularFechaRetorno(7));
    setLoanError(null);
    setShowLoanModal(true);
  };

  const handleSubmitLoan = async (e) => {
    e.preventDefault();
    setLoanError(null);

    if (!loanNombre || !loanApellido || !loanDpi || !loanContacto || !loanFechaRetorno) {
      setLoanError('Por favor complete todos los campos del préstamo.');
      return;
    }

    const dpiRegex = /^\d{13}$/;
    if (!dpiRegex.test(loanDpi)) {
      setLoanError('El DPI debe contener exactamente 13 dígitos numéricos.');
      return;
    }

    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phoneRegex.test(loanContacto) && !emailRegex.test(loanContacto)) {
      setLoanError('El contacto debe ser un número de teléfono de 8 dígitos o un correo electrónico válido.');
      return;
    }

    setLoanSubmitting(true);
    try {
      await apiLibrary.post('/loans', {
        libro_id: loanBookId,
        nombre_prestatario: loanNombre,
        apellido_prestatario: loanApellido,
        dpi: loanDpi,
        contacto: loanContacto,
        fecha_retorno_limite: new Date(loanFechaRetorno).toISOString()
      });
      setShowLoanModal(false);
      refreshAll();
    } catch (err) {
      setLoanError(err.response?.data?.message || 'Error al registrar el préstamo.');
    } finally {
      setLoanSubmitting(false);
    }
  };

  const handleReturnBook = async (libroId) => {
    try { await apiLibrary.post('/returns', { libro_id: libroId }); refreshAll(); }
    catch (err) { alert(err.response?.data?.message || 'Error al devolver'); }
  };

  const openBorrowerDetails = (libro) => {
    if (libro.prestamo) {
      setSelectedBorrower(libro.prestamo);
      setSelectedBorrowerBook(libro.titulo);
      setShowBorrowerModal(true);
    }
  };

  const getDisponibilidadPorcentaje = () => {
    if (!summary || summary.totalLibros === 0) return { dispPct: 0, prestPct: 0 };
    const dispPct = Math.round((summary.disponibles / summary.totalLibros) * 100);
    const prestPct = 100 - dispPct;
    return { dispPct, prestPct };
  };

  const selectStyle = {
    width: '100%', padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-main)', fontSize: '0.95rem', height: '2.625rem', outline: 'none'
  };
  const optionStyle = { background: 'var(--bg-secondary)', color: 'var(--text-main)' };

  const { dispPct, prestPct } = getDisponibilidadPorcentaje();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Panel de Control</h1>
          <p className="welcome-msg">Bienvenido, {user?.nombre || 'Usuario'}</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={refreshAll}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Actualizar
          </button>
        </div>
      </header>

      <div className="dashboard-content-layout">
        <aside className="sidebar-tabs">
          <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
            Resumen General
          </button>
          <button className={`tab-btn ${activeTab === 'catalogo' ? 'active' : ''}`} onClick={() => setActiveTab('catalogo')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Catálogo de Libros
          </button>
          <button className={`tab-btn ${activeTab === 'recomendar' ? 'active' : ''}`} onClick={() => setActiveTab('recomendar')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zm7.078-9.078L16 9l-.891-2.174L13 6l2.109-.891L16 3l.891 2.109L19 6l-2.109.891z" />
            </svg>
            Recomendaciones
          </button>
        </aside>

        <main style={{ flex: 1 }}>
          {activeTab === 'resumen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="stats-section">
                <h2 className="section-title">Métricas de Biblioteca</h2>
                {loadingStats ? (
                  <div className="stats-loader"><div className="btn-loader"></div><span>Calculando...</span></div>
                ) : errorStats ? (
                  <div className="alert alert-warning"><span>{errorStats}</span></div>
                ) : stats ? (
                  <div className="stats-grid">
                    <div className="stat-card blue">
                      <div className="stat-icon" style={{ color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 1 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <div className="stat-info"><h3>Total Libros</h3><p className="stat-value">{stats.totalLibros}</p></div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-icon" style={{ color: 'var(--success)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <div className="stat-info"><h3>Total Préstamos</h3><p className="stat-value">{stats.totalPrestamos}</p></div>
                    </div>
                    <div className="stat-card red">
                      <div className="stat-icon" style={{ color: 'var(--error)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div className="stat-info"><h3>Préstamos Activos</h3><p className="stat-value">{stats.prestamosActivos}</p></div>
                    </div>
                    <div className="stat-card purple">
                      <div className="stat-icon" style={{ color: '#8b5cf6' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.426.792-.426.94 0l1.84 4.096a1.125 1.125 0 0 0 .827.601l4.477.534c.47.056.66.634.314.939l-3.328 2.87a1.125 1.125 0 0 0-.315.967l1.045 4.39a1.125 1.125 0 0 1-1.6 1.162l-3.89-2.046a1.125 1.125 0 0 0-1.04 0l-3.89 2.046a1.125 1.125 0 0 1-1.6-1.162l1.045-4.39a1.125 1.125 0 0 0-.315-.967l-3.328-2.87a1.125 1.125 0 0 1 .314-.939l4.477-.534a1.125 1.125 0 0 0 .827-.601l1.84-4.096Z" />
                        </svg>
                      </div>
                      <div className="stat-info">
                        <h3>Más Solicitado</h3>
                        <p className="stat-title-highlight">{stats.masPrestado ? stats.masPrestado.titulo : 'Ninguno'}</p>
                        <span className="stat-subtitle">{stats.masPrestado ? `${stats.masPrestado.veces_prestado} préstamos` : '0 préstamos'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

              {summary && (
                <>
                  <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📊 Proporción de Disponibilidad del Catálogo</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total: {summary.totalLibros} libros</span>
                    </h3>

                    <div style={{ width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {summary.totalLibros > 0 ? (
                        <>
                          <div style={{ width: `${dispPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 0.4s ease' }} title={`Disponibles: ${summary.disponibles} (${dispPct}%)`}></div>
                          <div style={{ width: `${prestPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', transition: 'width 0.4s ease' }} title={`Prestados: ${summary.noDisponibles} (${prestPct}%)`}></div>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin libros en el catálogo</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }}></span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{dispPct}% Disponibles</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({summary.disponibles} libros)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--error)', display: 'inline-block' }}></span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{prestPct}% Prestados / En uso</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({summary.noDisponibles} libros)</span>
                      </div>
                    </div>
                  </section>

                  <section className="stats-section">
                    <h2 className="section-title">Disponibilidad Global</h2>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
                        <div className="stat-icon" style={{ color: 'var(--success)', marginRight: '0.5rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </div>
                        <div className="stat-info"><h3>Disponibles</h3><p className="stat-value" style={{ fontSize: '1.5rem' }}>{summary.disponibles}</p></div>
                      </div>
                      <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--error)' }}>
                        <div className="stat-icon" style={{ color: 'var(--error)', marginRight: '0.5rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </div>
                        <div className="stat-info"><h3>Prestados</h3><p className="stat-value" style={{ fontSize: '1.5rem' }}>{summary.noDisponibles}</p></div>
                      </div>
                      <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
                        <div className="stat-icon" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.699 2.479 0l4.318-4.318c.699-.699.699-1.78 0-2.479l-9.58-9.581A2.25 2.25 0 0 0 9.568 3Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                          </svg>
                        </div>
                        <div className="stat-info">
                          <h3>Categorías</h3>
                          <p className="stat-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.2rem', marginTop: '0.25rem' }}>
                            {summary.categorias.join(', ') || 'Ninguna'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === 'catalogo' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Filtrar Catálogo</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="input-group" style={{ flex: 2, minWidth: '180px' }}>
                    <label>Título</label>
                    <div className="input-wrapper">
                      <input type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} placeholder="Ej: Quijote" style={{ paddingLeft: '1rem' }} />
                    </div>
                  </div>
                  <div className="input-group" style={{ flex: 1.5, minWidth: '180px' }}>
                    <label>Autor</label>
                    <div className="input-wrapper">
                      <input type="text" value={searchAuthor} onChange={(e) => setSearchAuthor(e.target.value)} placeholder="Ej: Cervantes" style={{ paddingLeft: '1rem' }} />
                    </div>
                  </div>
                  <div className="input-group" style={{ flex: 1.2, minWidth: '180px' }}>
                    <label>Categoría</label>
                    <div className="input-wrapper">
                      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} style={selectStyle}>
                        <option value="" style={optionStyle}>Todas</option>
                        {categoriasPredefinidas.map(c => (<option key={c} value={c} style={optionStyle}>{c}</option>))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn-login" style={{ marginTop: 0, padding: '0.675rem 1.25rem' }}>Buscar</button>
                    <button type="button" className="btn-refresh" onClick={handleClearSearch} style={{ padding: '0.675rem 1.25rem' }}>Limpiar</button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Catálogo de Libros</h2>
                <button className="btn-login" style={{ marginTop: 0, padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={openAddModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Registrar Libro
                </button>
              </div>

              {loadingLibros ? (
                <div className="catalog-loader"><div className="spinner"></div><span>Cargando catálogo...</span></div>
              ) : errorLibros ? (
                <div className="alert alert-error"><span>{errorLibros}</span></div>
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
                          <th className="text-center">Préstamos</th>
                          <th>Estado</th>
                          <th>Prestatario</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {libros.length === 0 ? (
                          <tr><td colSpan="8" className="empty-row">No se encontraron libros.</td></tr>
                        ) : (
                          libros.map((libro) => (
                            <tr key={libro._id}>
                              <td>
                                <div className="libro-title-cell">
                                  <span className="book-emoji" style={{ display: 'inline-flex', color: 'var(--primary)' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                  </span>
                                  <span className="book-title">{libro.titulo}</span>
                                </div>
                              </td>
                              <td>{libro.autor}</td>
                              <td><span className="badge category-badge">{libro.categoria}</span></td>
                              <td>{libro.anio || 'N/A'}</td>
                              <td className="text-center">{libro.veces_prestado || 0}</td>
                              <td>
                                <span className={`badge status-badge ${libro.disponible ? 'disponible' : 'prestado'}`}>
                                  {libro.disponible ? 'Disponible' : 'Prestado'}
                                </span>
                              </td>
                              <td>
                                {!libro.disponible && libro.prestamo ? (
                                  <button
                                    onClick={() => openBorrowerDetails(libro)}
                                    style={{
                                      background: 'none', border: 'none',
                                      color: 'var(--primary)', cursor: 'pointer',
                                      fontSize: '0.85rem', fontWeight: 600,
                                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                      padding: 0, textDecoration: 'underline'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem' }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    {libro.prestamo.nombre_prestatario} {libro.prestamo.apellido_prestatario}
                                  </button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  {libro.disponible ? (
                                    <button className="btn-refresh" style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.25rem 0.50rem' }} onClick={() => openLoanModal(libro)}>
                                      Prestar
                                    </button>
                                  ) : (
                                    <button className="btn-refresh" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', padding: '0.25rem 0.50rem' }} onClick={() => handleReturnBook(libro._id)}>
                                      Devolver
                                    </button>
                                  )}
                                  <button className="btn-refresh" style={{ padding: '0.25rem 0.50rem' }} onClick={() => openEditModal(libro)}>Editar</button>
                                  <button className="btn-logout" style={{ padding: '0.25rem 0.50rem' }} onClick={() => handleDeleteLibro(libro._id)}>Eliminar</button>
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
          )}

          {activeTab === 'recomendar' && (
            <section className="stats-section">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zm7.078-9.078L16 9l-.891-2.174L13 6l2.109-.891L16 3l.891 2.109L19 6l-2.109.891z" />
                  </svg>
                  Recomendador de Libros
                </h3>
                <form onSubmit={handleFetchRecommendations} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ flex: 1, minWidth: '240px' }}>
                    <label>Categoría</label>
                    <div className="input-wrapper">
                      <select value={recCategory} onChange={(e) => setRecCategory(e.target.value)} style={selectStyle}>
                        {categoriasPredefinidas.map(c => (<option key={c} value={c} style={optionStyle}>{c}</option>))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-login" style={{ marginTop: 0, padding: '0.675rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.636Z" />
                    </svg>
                    Buscar
                  </button>
                </form>

                {loadingRecs && (<div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="btn-loader"></div><span>Analizando...</span></div>)}
                {errorRecs && (<div className="alert alert-error" style={{ marginTop: '1rem' }}><span>{errorRecs}</span></div>)}

                {!loadingRecs && recommendedBooks.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Disponibles en "{recCategory}":</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {recommendedBooks.map((book) => (
                        <div key={book._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                          <div><strong>{book.titulo}</strong><span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>de {book.autor}</span></div>
                          <button className="btn-refresh" style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.15rem 0.5rem', fontSize: '0.8rem' }} onClick={() => openLoanModal(book)}>Prestar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loadingRecs && recommendedBooks.length === 0 && recCategory && !errorRecs && (
                  <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay libros disponibles en "{recCategory}".</div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{editingLibro ? 'Editar Libro' : 'Registrar Nuevo Libro'}</h3>
            <form onSubmit={handleSaveLibro} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group"><label>Título *</label><div className="input-wrapper"><input type="text" value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} placeholder="Título del libro" required style={{ paddingLeft: '1rem' }} /></div></div>
              <div className="input-group"><label>Autor *</label><div className="input-wrapper"><input type="text" value={formAutor} onChange={(e) => setFormAutor(e.target.value)} placeholder="Autor del libro" required style={{ paddingLeft: '1rem' }} /></div></div>
              <div className="input-group"><label>Categoría *</label><div className="input-wrapper"><select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)} style={selectStyle}>{categoriasPredefinidas.map(c => (<option key={c} value={c} style={optionStyle}>{c}</option>))}</select></div></div>
              <div className="input-group"><label>Año</label><div className="input-wrapper"><input type="number" value={formAnio} onChange={(e) => setFormAnio(e.target.value)} placeholder="Ej: 1980" style={{ paddingLeft: '1rem' }} /></div></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-refresh" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-login" style={{ marginTop: 0, padding: '0.5rem 1.5rem' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', padding: '2rem', boxShadow: 'var(--shadow-lg)', margin: 'auto' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registrar Préstamo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Libro: <strong style={{ color: 'var(--text-main)' }}>{loanBookTitle}</strong>
            </p>

            {loanError && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ display: 'inline-flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </span>
                <span>{loanError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nombre(s) *</label>
                  <div className="input-wrapper"><input type="text" value={loanNombre} onChange={(e) => { setLoanNombre(e.target.value); setLoanError(null); }} placeholder="Nombre(s)" required style={{ paddingLeft: '1rem' }} /></div>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Apellido(s) *</label>
                  <div className="input-wrapper"><input type="text" value={loanApellido} onChange={(e) => { setLoanApellido(e.target.value); setLoanError(null); }} placeholder="Apellido(s)" required style={{ paddingLeft: '1rem' }} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>DPI (13 dígitos) *</label>
                  <div className="input-wrapper"><input type="text" value={loanDpi} onChange={(e) => { setLoanDpi(e.target.value); setLoanError(null); }} placeholder="Ej: 1234567890101" required style={{ paddingLeft: '1rem' }} /></div>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Celular (8 dig.) o Correo *</label>
                  <div className="input-wrapper"><input type="text" value={loanContacto} onChange={(e) => { setLoanContacto(e.target.value); setLoanError(null); }} placeholder="Ej: 55551234 o test@mail.com" required style={{ paddingLeft: '1rem' }} /></div>
                </div>
              </div>

              <div className="input-group">
                <label>Plazo Máximo de Retorno *</label>
                <div className="input-wrapper">
                  <select value={loanPlazo} onChange={(e) => handlePlazoChange(e.target.value)} style={selectStyle}>
                    {plazosPreestablecidos.map(p => (<option key={p.value} value={p.value} style={optionStyle}>{p.label}</option>))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Fecha y Hora Límite de Retorno *</label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    value={loanFechaRetorno}
                    onChange={(e) => { setLoanFechaRetorno(e.target.value); setLoanError(null); }}
                    required
                    readOnly={loanPlazo !== 'custom'}
                    style={{ ...selectStyle, cursor: loanPlazo !== 'custom' ? 'not-allowed' : 'text', opacity: loanPlazo !== 'custom' ? 0.7 : 1 }}
                  />
                </div>
                {loanPlazo !== 'custom' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Calculada automáticamente. Seleccione "Personalizado" para editar manualmente.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-refresh" onClick={() => setShowLoanModal(false)}>Cancelar</button>
                <button type="submit" className="btn-login" disabled={loanSubmitting} style={{ marginTop: 0, padding: '0.5rem 1.5rem' }}>
                  {loanSubmitting ? 'Procesando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBorrowerModal && selectedBorrower && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
                Ficha del Prestatario
              </h3>
              <button
                onClick={() => setShowBorrowerModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Libro en Préstamo</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>📖 {selectedBorrowerBook}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Nombre completo</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedBorrower.nombre_prestatario} {selectedBorrower.apellido_prestatario}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>DPI</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedBorrower.dpi}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Información de Contacto</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedBorrower.contacto}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Fecha de Préstamo</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(selectedBorrower.fecha_prestamo).toLocaleString()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--error)', display: 'block', marginBottom: '0.2rem', fontWeight: 500 }}>Límite de Retorno</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>{new Date(selectedBorrower.fecha_retorno_limite).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn-login"
                style={{ marginTop: 0, padding: '0.5rem 1.5rem' }}
                onClick={() => setShowBorrowerModal(false)}
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
