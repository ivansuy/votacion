// src/pages/administrador/Dashboard.jsx
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = "/login";
};

  const getActiveSection = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "inicio";
    if (path.includes("crear-votacion")) return "votacion";
    if (path.includes("crear-cargo")) return "crearCargo";
    if (path.includes("crear-reporte")) return "reporte";
    if (path.includes("usuarios")) return "usuarios";
    if (path.includes("resultados-votacion")) return "resultados";
    if (path.includes("gestion-votacion")) return "gestionVotacion";
    return "inicio";
  };

  const activeSection = getActiveSection();

  return (
    <div className="d-flex vh-100">
      <style>{`
        .sidebar {
          background: linear-gradient(180deg, #1a2a6c 0%, #b21f1f 100%);
          width: 280px;
          height: 100vh;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          overflow-y: auto; /* ✅ scroll en el menú lateral */
        }

        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .nav-link-custom {
          color: rgba(255,255,255,0.8);
          padding: 15px 20px;
          border-left: 4px solid transparent;
          transition: all 0.3s;
          text-decoration: none;
          display: block;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .nav-link-custom:hover,
        .nav-link-custom.active {
          color: white;
          background: rgba(255,255,255,0.1);
          border-left-color: #fdbb2d;
        }

        .nav-link-custom.logout:hover {
          background: rgba(220, 53, 69, 0.2);
          border-left-color: #dc3545;
        }

        .nav-link-custom i {
          width: 25px;
          margin-right: 10px;
        }

        .main-content {
          flex: 1;
          background: #f8f9fa;
          margin-left: 280px;
          padding: 0;
          height: 100vh;       /* ✅ siempre ocupa el alto de pantalla */
          overflow-y: auto;    /* ✅ scroll en el contenido derecho */
        }

        .content-area {
          padding: 30px;
        }

        .sidebar-section-title {
          padding: 10px 20px;
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .logout-section {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .welcome-card {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          border-left: 5px solid #1a2a6c;
          transition: transform 0.3s;
          text-align: center;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.votes { border-left-color: #b21f1f; }
        .stat-card.reports { border-left-color: #fdbb2d; }
        .stat-card.users { border-left-color: #28a745; }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-title {
          color: #6c757d;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .page-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        /* Estilos para las secciones hijas */
        .route-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          min-height: calc(100vh - 60px); /* ✅ asegura altura mínima */
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-church fa-2x mb-2"></i>
          <h5 className="fw-bold">ASAMBLEAS DE DIOS</h5>
          <small className="opacity-75">SENDERO DE LA CRUZ</small>
        </div>

        <nav className="nav flex-column py-3" style={{ flex: 1 }}>
          <div className="sidebar-section-title">Navegación</div>
          <button
            className={`nav-link-custom ${activeSection === "inicio" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="fas fa-home"></i> Panel Principal
          </button>

          <div className="sidebar-section-title">Votaciones</div>
          <button
            className={`nav-link-custom ${activeSection === "votacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-votacion")}
          >
            <i className="fas fa-vote-yea"></i> Crear Votación
          </button>
          {/* Gestión de Votación */}
          <div className="sidebar-section-title">GESTIÓN DE VOTACIÓN</div>
          <button
            className={`nav-link-custom ${activeSection === "gestionVotacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/gestion-votacion")}
          >
            <i className="fas fa-vote-yea"></i> Gestión de Votación
          </button>

          <div className="sidebar-section-title">Cargos</div>
          <button
            className={`nav-link-custom ${activeSection === "crearCargo" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-cargo")}
          >
            <i className="fas fa-briefcase"></i> Crear Cargo
          </button>

          <div className="sidebar-section-title">Resultados de Votación</div>
          <button
            className={`nav-link-custom ${activeSection === "resultados" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/resultados-votacion")}
          >
            <i className="fas fa-poll"></i> Resultados de Votación
          </button>

          <div className="sidebar-section-title">Reportes</div>
          <button
            className={`nav-link-custom ${activeSection === "reporte" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-reporte")}
          >
            <i className="fas fa-chart-bar"></i> Crear Reporte
          </button>

          <div className="sidebar-section-title">Usuarios</div>
          <button
            className={`nav-link-custom ${activeSection === "usuarios" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/usuarios")}
          >
            <i className="fas fa-users"></i> Usuarios
          </button>

          <div className="logout-section">
            <div className="sidebar-section-title">Cerrar Sesión</div>
            <button className="nav-link-custom logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      {/* Contenido */}
      <div className="main-content">
        <div className="content-area">
          {activeSection === "inicio" && (
            <>
              <div className="welcome-card">
                <h2 className="fw-bold">¡Bienvenido al Sistema de Votación!</h2>
                <p className="mb-0">
                  Gestiona las votaciones de la iglesia de manera eficiente y segura. 
                  Selecciona una opción en el menú para comenzar.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number" style={{ color: "#1a2a6c" }}>3</div>
                  <div className="stat-title">Votaciones Activas</div>
                  <small className="text-muted">En curso este mes</small>
                </div>
                <div className="stat-card votes">
                  <div className="stat-number" style={{ color: "#b21f1f" }}>156</div>
                  <div className="stat-title">Votos Realizados</div>
                  <small className="text-muted">Total en sistema</small>
                </div>
                <div className="stat-card reports">
                  <div className="stat-number" style={{ color: "#fdbb2d" }}>12</div>
                  <div className="stat-title">Reportes Generados</div>
                  <small className="text-muted">Este trimestre</small>
                </div>
                <div className="stat-card users">
                  <div className="stat-number" style={{ color: "#28a745" }}>89</div>
                  <div className="stat-title">Usuarios Registrados</div>
                  <small className="text-muted">Miembros activos</small>
                </div>
              </div>
            </>
          )}

          {activeSection !== "inicio" && (
            <div className="route-content">
              <Outlet />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
