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
      const { error } = await supabase
        .from("cargo")
        .insert([{ nombre_cargo: nombreCargo, descripcion }]);

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
      setNombreCargo("");
      setDescripcion("");
      navigate("/dashboard");
    }
  };

  const handleVolverAlMenu = () => navigate("/dashboard");

  return (
    <div className="crear-cargo-container">
      <style>{`
        /* ======== ESTRUCTURA GENERAL ======== */
        .crear-cargo-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .cargo-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .cargo-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .cargo-header p {
          opacity: 0.9;
        }

        /* ======== FORMULARIO ======== */
        .cargo-form {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          padding: 2rem;
        }

        .form-label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-control {
          border-radius: 10px;
          padding: 0.9rem;
          font-size: 1rem;
          border: 1.5px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #b21f1f;
          box-shadow: 0 0 0 0.15rem rgba(178,31,31,0.2);
        }

        textarea.form-control {
          resize: vertical;
          min-height: 100px;
        }

        /* ======== BOTONES ======== */
        .btn-primary-custom {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          font-weight: 600;
          border: none;
          padding: 0.9rem;
          border-radius: 12px;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }

        .btn-primary-custom:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(178,31,31,0.3);
        }

        .btn-secondary-custom {
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 0.9rem;
          font-weight: 600;
        }

        /* ======== MODAL ======== */
        .modal.show {
          background-color: rgba(0,0,0,0.6);
        }
        .modal-content {
          border-radius: 15px;
          overflow: hidden;
        }

        /* ======== RESPONSIVE ======== */
        @media (max-width: 768px) {
          .cargo-header {
            padding: 1.5rem;
          }
          .cargo-form {
            padding: 1.5rem;
          }
          .btn-primary-custom, .btn-secondary-custom {
            font-size: 1rem;
          }
        }
      `}</style>

      {/* 🔹 Encabezado con estilo similar a Dashboard */}
      <div className="cargo-header">
        <i className="fas fa-briefcase fa-3x mb-3"></i>
        <h2>Crear Nuevo Cargo</h2>
        <p>Define los cargos disponibles para las votaciones</p>
      </div>

      {/* 🔹 Formulario principal */}
      <div className="cargo-form">
        <form onSubmit={handleCrearCargo}>
          {/* Campo: Nombre del Cargo */}
          <div className="mb-4">
            <label className="form-label">
              <i className="fas fa-tag text-danger me-2"></i>
              Nombre del Cargo
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Pastor Principal, Diácono, Secretario..."
              value={nombreCargo}
              onChange={(e) => setNombreCargo(e.target.value)}
              required
            />
            <small className="text-muted">Ingresa el nombre oficial del cargo</small>
          </div>

          {/* Campo: Descripción */}
          <div className="mb-4">
            <label className="form-label">
              <i className="fas fa-file-alt text-danger me-2"></i>
              Descripción del Cargo
            </label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Describe las responsabilidades y funciones de este cargo..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
            <small className="text-muted">
              Opcional: Detalla las funciones y responsabilidades
            </small>
          </div>

          {/* Botones */}
          <div className="d-grid gap-3 mt-4">
            <button
              type="submit"
              className="btn btn-primary-custom"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creando Cargo...
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle me-2"></i> Crear Cargo
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary-custom"
              onClick={handleVolverAlMenu}
            >
              <i className="fas fa-times me-2"></i> Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Modal de confirmación */}
      {mostrarModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className={`modal-content border-0 shadow-lg ${
                tipoModal === "success" ? "border-success" : "border-danger"
              }`}
            >
              <div
                className={`modal-header border-0 ${
                  tipoModal === "success"
                    ? "bg-success text-white"
                    : "bg-danger text-white"
                }`}
              >
                <h5 className="modal-title fw-bold">
                  <i
                    className={`fas ${
                      tipoModal === "success"
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                    } me-2`}
                  ></i>
                  {tipoModal === "success" ? "¡Cargo Creado!" : "Error"}
                </h5>
              </div>

              <div className="modal-body text-center py-4">
                <div
                  className={`display-4 ${
                    tipoModal === "success" ? "text-success" : "text-danger"
                  } mb-3`}
                >
                  <i
                    className={`fas ${
                      tipoModal === "success"
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                    }`}
                  ></i>
                </div>
                <h5 className="fw-bold">{mensajeModal}</h5>
                <p className="text-muted mt-3">
                  {tipoModal === "success"
                    ? "El cargo ha sido registrado exitosamente en el sistema."
                    : "Por favor verifica la información e intenta nuevamente."}
                </p>
              </div>

              <div className="modal-footer border-0 justify-content-center">
                <button
                  type="button"
                  className={`btn ${
                    tipoModal === "success" ? "btn-success" : "btn-danger"
                  } btn-lg px-4 fw-bold`}
                  onClick={handleCerrarModal}
                  style={{ borderRadius: "10px" }}
                >
                  <i className="fas fa-check me-2"></i>
                  {tipoModal === "success"
                    ? "Volver al Menú Principal"
                    : "Aceptar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
