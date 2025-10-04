import { useState } from "react";
import { supabase } from "../../Config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Recuperar() {
  const [nombre, setNombre] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tipoModal, setTipoModal] = useState(""); // "success" o "error"
  const navigate = useNavigate();

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("usuario")
        .update({ contrasena: nuevaContrasena })
        .eq("nombre", nombre)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length === 0) {
        setMensajeModal("⚠️ Usuario no encontrado");
        setTipoModal("error");
      } else {
        setMensajeModal("✅ Contraseña actualizada correctamente");
        setTipoModal("success");
      }
      setMostrarModal(true);
    } catch (error) {
      setMensajeModal("❌ Error al actualizar contraseña: " + error.message);
      setTipoModal("error");
      setMostrarModal(true);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    if (tipoModal === "success") {
      navigate("/login");
    }
  };

  return (
    <>
      <div className="min-vh-100 bg-gradient-warning d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 rounded-lg">
                {/* Header */}
                <div className="card-header bg-warning text-dark text-center py-4">
                  <h3 className="fw-bold mb-0">
                    <i className="bi bi-key-fill me-2"></i>
                    Recuperar Contraseña
                  </h3>
                  <p className="mb-0 opacity-75">Restablece tu acceso</p>
                </div>

                {/* Body */}
                <div className="card-body p-5">
                  <form onSubmit={handleRecuperar}>
                    {/* Nombre de usuario */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2 text-warning"></i>
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                        required
                      />
                    </div>

                    {/* Nueva contraseña */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-shield-lock-fill me-2 text-warning"></i>
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        minLength="6"
                      />
                      <div className="form-text">
                        La contraseña debe tener al menos 6 caracteres
                      </div>
                    </div>

                    {/* Botón de recuperación */}
                    <div className="d-grid mb-4">
                      <button 
                        type="submit" 
                        className="btn btn-warning btn-lg fw-bold"
                        disabled={cargando}
                      >
                        {cargando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Actualizar Contraseña
                          </>
                        )}
                      </button>
                    </div>

                    {/* Enlaces de navegación */}
                    <div className="text-center">
                      <p className="mb-2">
                        ¿Recordaste tu contraseña?{" "}
                        <Link 
                          to="/login" 
                          className="text-warning fw-semibold text-decoration-none"
                        >
                          Inicia Sesión
                        </Link>
                      </p>
                      <p className="mb-0">
                        ¿No tienes cuenta?{" "}
                        <Link 
                          to="/registro" 
                          className="text-warning fw-semibold text-decoration-none"
                        >
                          Regístrate
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="card-footer text-center py-3 bg-light">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Ingresa tu nombre de usuario para restablecer la contraseña
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content ${tipoModal === 'success' ? 'border-success' : 'border-danger'}`}>
              <div className={`modal-header ${tipoModal === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                <h5 className="modal-title">
                  <i className={`bi ${tipoModal === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                  {tipoModal === 'success' ? '¡Éxito!' : 'Error'}
                </h5>
              </div>
              <div className="modal-body text-center py-4">
                <div className={`display-4 ${tipoModal === 'success' ? 'text-success' : 'text-danger'} mb-3`}>
                  <i className={`bi ${tipoModal === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}></i>
                </div>
                <h5>{mensajeModal}</h5>
                <p className="text-muted mt-3">
                  {tipoModal === 'success' 
                    ? 'Tu contraseña ha sido actualizada correctamente.' 
                    : 'Por favor verifica la información e intenta nuevamente.'}
                </p>
              </div>
              <div className="modal-footer justify-content-center">
                <button 
                  type="button" 
                  className={`btn ${tipoModal === 'success' ? 'btn-success' : 'btn-danger'} btn-lg px-4`}
                  onClick={handleCerrarModal}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales */}
      <style>{`
  .bg-gradient-warning {
    background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%); /* gris claro a blanco */
  }
  .card {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }
  .form-control:focus {
    border-color: #6c757d; /* gris oscuro */
    box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
  }
  .btn-warning {
    background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%); /* gris degradado */
    border: none;
    color: #fff;
  }
  .btn-warning:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
    color: #fff;
  }
  .btn-warning:disabled {
    opacity: 0.7;
  }
  .modal-content {
    border-radius: 15px;
    overflow: hidden;
  }
  .modal-header {
    border: none;
  }
`}</style>

    </>
  );
}