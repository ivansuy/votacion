import { useState } from "react";
import { supabase } from "../../Config/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CrearCargo() {
  const [nombreCargo, setNombreCargo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tipoModal, setTipoModal] = useState(""); // "success" o "error"
  const navigate = useNavigate();

  const handleCrearCargo = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("cargo")
        .insert([
          {
            nombre_cargo: nombreCargo,
            descripcion: descripcion,
          },
        ])
        .select();

      if (error) throw error;

      setMensajeModal("✅ Cargo creado correctamente");
      setTipoModal("success");
      setMostrarModal(true);
    } catch (error) {
      setMensajeModal("❌ Error al crear cargo: " + error.message);
      setTipoModal("error");
      setMostrarModal(true);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    if (tipoModal === "success") {
      // Limpiar formulario
      setNombreCargo("");
      setDescripcion("");
      // Redirigir al dashboard
      navigate("/dashboard");
    }
  };

  const handleVolverAlMenu = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Header con botón de volver */}
            <div className="d-flex justify-content-between align-items-center mb-4">
            
            
            </div>

            {/* Card Principal */}
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-header bg-gradient-primary text-white py-4 rounded-top-3">
                <div className="text-center">
                  <i className="fas fa-briefcase fa-3x mb-3"></i>
                  <h3 className="fw-bold mb-2">Crear Nuevo Cargo</h3>
                  <p className="mb-0 opacity-75">
                    Define los cargos disponibles para las votaciones
                  </p>
                </div>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleCrearCargo}>
                  {/* Nombre del Cargo */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-tag text-primary me-2"></i>
                      Nombre del Cargo
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={nombreCargo}
                      onChange={(e) => setNombreCargo(e.target.value)}
                      placeholder="Ej: Pastor Principal, Diácono, Secretario..."
                      required
                      style={{
                        borderColor: '#e9ecef',
                        borderRadius: '10px'
                      }}
                    />
                    <div className="form-text text-muted">
                      Ingresa el nombre oficial del cargo
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-file-alt text-primary me-2"></i>
                      Descripción del Cargo
                    </label>
                    <textarea
                      className="form-control border-2"
                      rows="4"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe las responsabilidades y funciones de este cargo..."
                      style={{
                        borderColor: '#e9ecef',
                        borderRadius: '10px',
                        resize: 'vertical'
                      }}
                    ></textarea>
                    <div className="form-text text-muted">
                      Opcional: Detalla las funciones y responsabilidades
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-grid gap-3 mt-5">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg fw-bold py-3"
                      disabled={cargando}
                      style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                    >
                      {cargando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creando Cargo...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus-circle me-2"></i>
                          Crear Cargo
                        </>
                      )}
                    </button>

                    <button 
                      type="button"
                      className="btn btn-outline-secondary btn-lg py-3"
                      onClick={handleVolverAlMenu}
                      style={{ borderRadius: '12px' }}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer informativo */}
              <div className="card-footer bg-light text-center py-3 rounded-bottom-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Los cargos creados estarán disponibles para asignar en las votaciones
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content border-0 shadow-lg ${tipoModal === 'success' ? 'border-success' : 'border-danger'}`}>
              {/* Header del Modal */}
              <div className={`modal-header border-0 ${tipoModal === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                <h5 className="modal-title fw-bold">
                  <i className={`fas ${tipoModal === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {tipoModal === 'success' ? '¡Cargo Creado!' : 'Error'}
                </h5>
              </div>

              {/* Body del Modal */}
              <div className="modal-body text-center py-4">
                <div className={`display-4 ${tipoModal === 'success' ? 'text-success' : 'text-danger'} mb-3`}>
                  <i className={`fas ${tipoModal === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                </div>
                <h5 className="fw-bold">{mensajeModal}</h5>
                <p className="text-muted mt-3">
                  {tipoModal === 'success' 
                    ? 'El cargo ha sido registrado exitosamente en el sistema.' 
                    : 'Por favor verifica la información e intenta nuevamente.'}
                </p>
              </div>

              {/* Footer del Modal */}
              <div className="modal-footer border-0 justify-content-center">
                <button 
                  type="button" 
                  className={`btn ${tipoModal === 'success' ? 'btn-success' : 'btn-danger'} btn-lg px-4 fw-bold`}
                  onClick={handleCerrarModal}
                  style={{ borderRadius: '10px' }}
                >
                  <i className="fas fa-check me-2"></i>
                  {tipoModal === 'success' ? 'Volver al Menú Principal' : 'Aceptar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales */}
      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        .card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-outline-primary:hover {
          transform: translateY(-1px);
        }
        .modal-content {
          border-radius: 15px;
          overflow: hidden;
        }
        .rounded-top-3 {
          border-top-left-radius: 1rem !important;
          border-top-right-radius: 1rem !important;
        }
        .rounded-bottom-3 {
          border-bottom-left-radius: 1rem !important;
          border-bottom-right-radius: 1rem !important;
        }
      `}</style>
    </>
  );
}