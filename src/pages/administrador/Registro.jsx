import { useState } from "react";
import { supabase } from "../../Config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tipoModal, setTipoModal] = useState(""); // "success" o "error"
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("usuario")
        .insert([
          {
            nombre,
            contrasena,
            telefono,
            fecha: new Date().toISOString().split("T")[0],
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      setMensajeModal("✅ Usuario creado correctamente");
      setTipoModal("success");
      setMostrarModal(true);
    } catch (error) {
      setMensajeModal("❌ Error al crear usuario: " + error.message);
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
      <div className="min-vh-100 bg-gradient-primary d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 rounded-lg">
                {/* Header */}
                <div className="card-header bg-primary text-white text-center py-4">
                  <h3 className="fw-bold mb-0">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Crear Cuenta
                  </h3>
                  <p className="mb-0 opacity-75">Regístrate para comenzar</p>
                </div>

                {/* Body */}
                <div className="card-body p-5">
                  <form onSubmit={handleRegistro}>
                    {/* Nombre */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2 text-primary"></i>
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ingresa tu nombre"
                        required
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-telephone-fill me-2 text-primary"></i>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ingresa tu teléfono"
                        required
                      />
                    </div>

                    {/* Contraseña */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock-fill me-2 text-primary"></i>
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        placeholder="Crea una contraseña segura"
                        required
                        minLength="6"
                      />
                      <div className="form-text">
                        La contraseña debe tener al menos 6 caracteres
                      </div>
                    </div>

                    {/* Botón de registro */}
                    <div className="d-grid mb-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={cargando}
                      >
                        {cargando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creando cuenta...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus-fill me-2"></i>
                            Crear Cuenta
                          </>
                        )}
                      </button>
                    </div>

                    {/* Enlace a login */}
                    <div className="text-center">
                      <p className="mb-0">
                        ¿Ya tienes una cuenta?{" "}
                        <Link 
                          to="/login" 
                          className="text-primary fw-semibold text-decoration-none"
                        >
                          Inicia Sesión
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="card-footer text-center py-3 bg-light">
                  <small className="text-muted">
                    Al registrarte, aceptas nuestros términos y condiciones
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
                  {tipoModal === 'success' ? '¡Registro Exitoso!' : 'Error en Registro'}
                </h5>
              </div>
              <div className="modal-body text-center py-4">
                <div className={`display-4 ${tipoModal === 'success' ? 'text-success' : 'text-danger'} mb-3`}>
                  <i className={`bi ${tipoModal === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}></i>
                </div>
                <h5>{mensajeModal}</h5>
                <p className="text-muted mt-3">
                  {tipoModal === 'success' 
                    ? 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.' 
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
                  {tipoModal === 'success' ? 'Ir a Login' : 'Aceptar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales */}
      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-primary:disabled {
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