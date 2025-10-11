import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "../../Config/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    votacionesActivas: 0,
    votosRealizados: 0,
    reportesGenerados: 0,
    usuariosRegistrados: 0,
  });

  const [topCandidatos, setTopCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleNavigation = (path) => navigate(path);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
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

  // 🔹 Consultar estadísticas desde Supabase
  const fetchStats = async () => {
    setLoading(true);
    try {
      const { count: votacionesActivas } = await supabase
        .from("votacion")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Activa");

      const { count: votosRealizados } = await supabase
        .from("voto")
        .select("*", { count: "exact", head: true });

      const { count: usuariosRegistrados } = await supabase
        .from("usuario")
        .select("*", { count: "exact", head: true });

      // Si tienes tabla de reportes
      const { count: reportesGenerados } = await supabase
        .from("reporte")
        .select("*", { count: "exact", head: true })
        .maybeSingle();

      setStats({
        votacionesActivas: votacionesActivas || 0,
        votosRealizados: votosRealizados || 0,
        reportesGenerados: reportesGenerados || 0,
        usuariosRegistrados: usuariosRegistrados || 0,
      });

      // 🔹 Top 5 candidatos más votados
      const { data: top } = await supabase
        .from("candidato")
        .select("nombre, votos_recibidos")
        .order("votos_recibidos", { ascending: false })
        .limit(5);

      setTopCandidatos(top || []);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeSection === "inicio") fetchStats();
  }, [activeSection]);

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
          overflow-y: auto;
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
        .logout-section {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .main-content {
          flex: 1;
          background: #f8f9fa;
          margin-left: 280px;
          padding: 0;
          overflow-y: auto;
        }
        .content-area {
          padding: 30px;
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
          text-align: center;
          transition: transform 0.3s;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
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
          <button
            className={`nav-link-custom ${activeSection === "inicio" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="fas fa-home"></i> Panel Principal
          </button>
          <button
            className={`nav-link-custom ${activeSection === "votacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/crear-votacion")}
          >
            <i className="fas fa-vote-yea"></i> Crear Votación
          </button>
          <button
            className={`nav-link-custom ${activeSection === "gestionVotacion" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/gestion-votacion")}
          >
            <i className="fas fa-tasks"></i> Gestión de Votación
          </button>
          <button
            className={`nav-link-custom ${activeSection === "usuarios" ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard/usuarios")}
          >
            <i className="fas fa-users"></i> Usuarios
          </button>
          <div className="logout-section">
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
                </p>
              </div>

              {loading ? (
                <div className="text-center text-muted">Cargando estadísticas...</div>
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>{stats.votacionesActivas}</h3>
                      <p className="text-muted">Votaciones Activas</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.votosRealizados}</h3>
                      <p className="text-muted">Votos Realizados</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.reportesGenerados}</h3>
                      <p className="text-muted">Reportes Generados</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.usuariosRegistrados}</h3>
                      <p className="text-muted">Usuarios Registrados</p>
                    </div>
                  </div>

                  {/* 📊 Top candidatos */}
                  <div className="chart-container">
                    <h5 className="fw-bold mb-3">
                      Top 5 Candidatos con más votos
                    </h5>
                    {topCandidatos.length === 0 ? (
                      <p className="text-muted">No hay candidatos con votos aún.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCandidatos}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nombre" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="votos_recibidos" fill="#b21f1f" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </>
              )}
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
