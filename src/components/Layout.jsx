// src/components/Layout.jsx
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí puedes agregar lógica para limpiar localStorage, tokens, etc.
    localStorage.removeItem('authToken'); // Si usas tokens
    localStorage.removeItem('userData'); // Si guardas datos de usuario
    
    // Redirigir al login
    navigate("/");
  };

  const getActiveSection = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "inicio";
    if (path.includes("crear-votacion")) return "votacion";
    if (path.includes("crear-cargo")) return "crearCargo";
    if (path.includes("resultados-votacion")) return "resultados";
    if (path.includes("crear-reporte")) return "reporte";
    if (path.includes("usuarios")) return "usuarios";
    return "inicio";
  };

  const activeSection = getActiveSection();

  return (
    <div className="d-flex vh-100">
      <style>
        {`
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

          .nav-link-custom:hover, .nav-link-custom.active {
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
            min-height: 100vh;
            margin-left: 280px;
            padding: 0;
          }

          .content-area {
            padding: 30px;
          }

          .section-divider {
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, #dee2e6, transparent);
            margin: 20px 0;
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
        `}
      </style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-church fa-2x mb-2"></i>
          <h5 className="fw-bold">ASAMBLEAS DE DIOS</h5>
          <small className="opacity-75">SENDERO DE LA CRUZ</small>
        </div>

        <nav className="nav flex-column py-3" style={{ flex: 1 }}>
          {/* Navegación Principal */}
          <div className="sidebar-section-title">NAVEGACIÓN</div>
          <button
            className={`nav-link-custom ${activeSection === "inicio" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="fas fa-home"></i> Panel Principal
          </button>

          {/* Votaciones */}
          <div className="sidebar-section-title">VOTACIONES</div>
          <button
            className={`nav-link-custom ${activeSection === "votacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-votacion")}
          >
            <i className="fas fa-vote-yea"></i> Crear Votación
          </button>
          {/* Cargos */}
          <div className="sidebar-section-title">CARGOS</div>
          <button
            className={`nav-link-custom ${activeSection === "crearCargo" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-cargo")}
          >
            <i className="fas fa-briefcase"></i> Crear Cargo
          </button>
          
             {/* Resultados de Votación */}
          <div className="sidebar-section-title">RESULTADOS DE VOTACIÓN</div>
          <button
            className={`nav-link-custom ${activeSection === "resultados" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/resultados-votacion")}
          >
            <i className="fas fa-vote-yea"></i> Resultados de Votación
          </button>


          {/* Reportes */}
          <div className="sidebar-section-title">REPORTES</div>
          <button
            className={`nav-link-custom ${activeSection === "reporte" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-reporte")}
          >
            <i className="fas fa-chart-bar"></i> Crear Reporte
          </button>

          {/* Usuarios */}
          <div className="sidebar-section-title">USUARIOS</div>
          <button
            className={`nav-link-custom ${activeSection === "usuarios" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/usuarios")}
          >
            <i className="fas fa-users"></i> Usuarios
          </button>

          {/* Cerrar Sesión - En la parte inferior */}
          <div className="logout-section">
            <div className="sidebar-section-title">CERRAR SESIÓN</div>
            <button
              className="nav-link-custom logout"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}