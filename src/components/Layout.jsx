import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🔹 Reabrir el menú automáticamente al volver a escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setSidebarOpen(false); // cerrar en móvil
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
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
    if (path.includes("gestion-votacion")) return "gestionVotacion";
    return "inicio";
  };

  const activeSection = getActiveSection();

  return (
    <div className="layout-container">
      <style>{`
        /* ========== BASE GENERAL ========== */
        .layout-container {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
          overflow-x: hidden;
        }

        /* ======== SIDEBAR ======== */
        .sidebar {
          background: linear-gradient(180deg, #1a2a6c 0%, #b21f1f 100%);
          width: 280px;
          height: 100vh;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          transition: left 0.3s ease-in-out;
          box-shadow: 2px 0 10px rgba(0,0,0,0.2);
          overflow-y: auto;
        }

        .sidebar.closed {
          left: -280px;
        }

        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .sidebar-header i {
          color: #fff;
        }

        .sidebar-header h5 {
          margin-top: 10px;
          font-weight: 700;
        }

        .nav-link-custom {
          color: rgba(255,255,255,0.85);
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
          background: rgba(255,255,255,0.15);
          border-left-color: #fdbb2d;
        }

        .sidebar-section-title {
          padding: 10px 20px;
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .logout-section {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.15);
        }

        /* ======== CONTENIDO PRINCIPAL ======== */
        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease-in-out;
        }

        .content-area {
          padding: 30px;
        }

        /* ======== BOTÓN MENÚ (MÓVIL) ======== */
        .menu-toggle {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          background: #b21f1f;
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 1.3rem;
          z-index: 1100;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }

        .menu-toggle:hover {
          background: #8e1717;
        }

        /* ======== RESPONSIVE ======== */
        @media (max-width: 768px) {
          .sidebar {
            width: 70%;
            left: -100%;
          }

          .sidebar.open {
            left: 0;
          }

          .main-content {
            margin-left: 0;
            width: 100%;
          }

          .content-area {
            padding: 15px;
          }

          .menu-toggle {
            display: block;
          }
        }

        /* ======== DESKTOP FIX ======== */
        @media (min-width: 769px) {
          .sidebar {
            left: 0 !important;
          }
          .main-content {
            margin-left: 280px !important;
          }
        }
      `}</style>

      {/* 🔹 Botón menú móvil */}
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      {/* 🔹 Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <i className="fas fa-church fa-2x mb-2"></i>
          <h5 className="fw-bold">ASAMBLEAS DE DIOS</h5>
          <small className="opacity-75">SENDERO DE LA CRUZ</small>
        </div>

        <nav className="nav flex-column py-3" style={{ flex: 1 }}>
          <div className="sidebar-section-title">NAVEGACIÓN</div>
          <button
            className={`nav-link-custom ${activeSection === "inicio" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="fas fa-home me-2"></i> Panel Principal
          </button>

          <div className="sidebar-section-title">VOTACIONES</div>
          <button
            className={`nav-link-custom ${activeSection === "votacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-votacion")}
          >
            <i className="fas fa-vote-yea me-2"></i> Crear Votación
          </button>

          <div className="sidebar-section-title">GESTIÓN DE VOTACIÓN</div>
          <button
            className={`nav-link-custom ${activeSection === "gestionVotacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/gestion-votacion")}
          >
            <i className="fas fa-tasks me-2"></i> Gestión de Votación
          </button>

          <div className="sidebar-section-title">CARGOS</div>
          <button
            className={`nav-link-custom ${activeSection === "crearCargo" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-cargo")}
          >
            <i className="fas fa-briefcase me-2"></i> Crear Cargo
          </button>

          <div className="sidebar-section-title">RESULTADOS</div>
          <button
            className={`nav-link-custom ${activeSection === "resultados" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/resultados-votacion")}
          >
            <i className="fas fa-chart-bar me-2"></i> Resultados de Votación
          </button>

          <div className="sidebar-section-title">REPORTES</div>
          <button
            className={`nav-link-custom ${activeSection === "reporte" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-reporte")}
          >
            <i className="fas fa-file-alt me-2"></i> Crear Reporte
          </button>

          <div className="sidebar-section-title">USUARIOS</div>
          <button
            className={`nav-link-custom ${activeSection === "usuarios" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/usuarios")}
          >
            <i className="fas fa-users me-2"></i> Usuarios
          </button>

          <div className="logout-section">
            <div className="sidebar-section-title">CERRAR SESIÓN</div>
            <button className="nav-link-custom logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      {/* 🔹 Contenido principal */}
      <div className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
