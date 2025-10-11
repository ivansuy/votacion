import { supabase } from "../../Config/supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 🧩 Modal de alertas reutilizable
function ModalAlert({ show, type, title, message, onClose }) {
  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const colors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-primary text-white",
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}
    >
      <div
        className="card shadow-lg text-center"
        style={{ width: "400px", borderRadius: "10px" }}
      >
        <div className={`card-header fw-bold ${colors[type]}`}>
          {icons[type]} {title}
        </div>
        <div className="card-body">
          <p className="fs-6">{message}</p>
          <button className="btn btn-success px-4" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  // Estado para mostrar alertas
  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
  });

  const showModal = (type, title, message) =>
    setModal({ show: true, type, title, message });
  const closeModal = () => setModal({ ...modal, show: false });

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("nombre", user)
      .eq("contrasena", pass)
      .single();

    if (error || !data) {
      showModal("error", "Acceso Denegado", "❌ Credenciales incorrectas. Inténtalo de nuevo.");
    } else {
      showModal("success", "Bienvenido", `Hola ${data.nombre}, acceso autorizado.`);
      // Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(data));
      // Redirigir tras un pequeño retraso para que el usuario vea el modal
      setTimeout(() => {
        closeModal();
        navigate("/dashboard");
      }, 1500);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .login-card { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.95); border: none; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3); transition: transform 0.3s ease; }
        .login-card:hover { transform: translateY(-5px); }
        .church-header { background: linear-gradient(135deg, #1a2a6c, #b21f1f); color: white; padding: 25px 20px; margin: -16px -16px 20px -16px; border-radius: 20px 20px 0 0; }
        .input-group-custom { border-radius: 12px; overflow: hidden; border: 2px solid #e9ecef; transition: all 0.3s; }
        .input-group-custom:focus-within { border-color: #1a2a6c; box-shadow: 0 0 0 0.2rem rgba(26, 42, 108, 0.25); }
        .input-group-text-custom { background: white; border: none; padding: 12px 15px; }
        .form-control-custom { border: none; padding: 12px; font-size: 16px; }
        .form-control-custom:focus { box-shadow: none; }
        .btn-login { background: linear-gradient(135deg, #1a2a6c, #b21f1f); border: none; border-radius: 25px; padding: 12px; font-weight: 600; font-size: 16px; transition: all 0.3s; }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
        .link-custom { color: #1a2a6c; text-decoration: none; font-weight: 500; transition: color 0.3s; }
        .link-custom:hover { color: #b21f1f; }
      `}</style>

      {/* TARJETA LOGIN */}
      <div className="card login-card p-4" style={{ width: "400px" }}>
        <div className="church-header text-center">
          <div className="mb-3">
            <i className="fas fa-church fa-3x"></i>
          </div>
          <h4 className="fw-bold mb-1">ASAMBLEAS DE DIOS</h4>
          <p className="mb-0">SENDERO DE LA CRUZ</p>
          <small>Sistema de Votación</small>
        </div>

        <h3 className="text-center fw-bold mb-4" style={{ color: "#1a2a6c" }}>
          Bienvenido
        </h3>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ color: "#1a2a6c" }}>
              Usuario
            </label>
            <div className="input-group-custom">
              <span className="input-group-text-custom">
                <i className="fas fa-user text-primary"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Ingresa tu usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ color: "#1a2a6c" }}>
              Contraseña
            </label>
            <div className="input-group-custom">
              <span className="input-group-text-custom">
                <i className="fas fa-lock text-primary"></i>
              </span>
              <input
                type="password"
                className="form-control form-control-custom"
                placeholder="Ingresa tu contraseña"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-login w-100 text-white fw-bold mb-3">
            Ingresar
          </button>

          <div className="text-center mb-3">
            <a href="/Recuperar" className="link-custom" style={{ fontSize: "14px" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="text-center">
            <a href="/Registro" className="link-custom" style={{ fontSize: "14px" }}>
              Crear cuenta
            </a>
          </div>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos" - Mateo 18:20
          </small>
        </div>
      </div>

      {/* MODAL DE ALERTA */}
      <ModalAlert
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
}
