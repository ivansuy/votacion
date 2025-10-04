import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ background: "#222", padding: "10px" }}>
      <Link to="/dashboard" style={{ color: "#fff", margin: "10px" }}>Inicio</Link>
      <Link to="/dashboard/crear-votacion" style={{ color: "#fff", margin: "10px" }}>Crear Votación</Link>
      <Link to="/dashboard/crear-cargo" style={{ color: "#fff", margin: "10px" }}>Crear Cargo</Link>
      <Link to="/dashboard/crear-reporte" style={{ color: "#fff", margin: "10px" }}>Crear Reporte</Link>
      <Link to="/dashboard/usuarios" style={{ color: "#fff", margin: "10px" }}>Usuarios</Link>
    </nav>
  )
}
