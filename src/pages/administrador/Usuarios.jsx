import { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";

/* ===== Componente de Modal ===== */
function ModalAlert({ show, type, title, message, onClose, onConfirm }) {
  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    confirm: "❓",
  };

  const colors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-primary text-white",
    confirm: "bg-secondary text-white",
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}
    >
      <div
        className="card shadow-lg text-center"
        style={{ width: "420px", borderRadius: "12px" }}
      >
        <div className={`card-header fw-bold ${colors[type]}`}>
          {icons[type]} {title}
        </div>
        <div className="card-body">
          <p className="fs-6">{message}</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            {type === "confirm" ? (
              <>
                <button
                  className="btn btn-success px-4"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Confirmar
                </button>
                <button className="btn btn-secondary px-4" onClick={onClose}>
                  Cancelar
                </button>
              </>
            ) : (
              <button className="btn btn-success px-4" onClick={onClose}>
                Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Página principal ===== */
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showModal = (type, title, message, onConfirm = null) =>
    setModal({ show: true, type, title, message, onConfirm });
  const closeModal = () => setModal({ ...modal, show: false });

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usuario")
      .select("id_usuario, nombre, telefono, fecha")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("❌ Error cargando usuarios:", error);
      showModal("error", "Error", "Error cargando usuarios.");
      setUsuarios([]);
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCrearUsuario = async () => {
    if (!nombre.trim() || !contrasena.trim()) {
      showModal("warning", "Datos incompletos", "Debes llenar el nombre y la contraseña.");
      return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),
      contrasena: contrasena.trim(),
      telefono: telefono.trim() || null,
      fecha: new Date(),
    };

    const { error } = await supabase.from("usuario").insert([nuevoUsuario]);

    if (error) {
      console.error("❌ Error creando usuario:", error);
      showModal("error", "Error", "No se pudo crear el usuario.");
      return;
    }

    showModal("success", "Usuario Creado", "El usuario fue agregado correctamente.");
    setNombre("");
    setTelefono("");
    setContrasena("");
    fetchUsuarios();
  };

  const handleEliminar = (id_usuario, nombreUsuario) => {
    showModal(
      "confirm",
      "Eliminar Usuario",
      `¿Seguro que deseas eliminar a "${nombreUsuario}"?`,
      async () => {
        const { error } = await supabase
          .from("usuario")
          .delete()
          .eq("id_usuario", id_usuario);

        if (error) {
          console.error("❌ Error eliminando usuario:", error);
          showModal("error", "Error", "No se pudo eliminar el usuario.");
          return;
        }

        showModal("success", "Eliminado", `${nombreUsuario} fue eliminado correctamente.`);
        fetchUsuarios();
      }
    );
  };

  return (
    <div className="usuarios-container">
      <style>{`
        .usuarios-container {
          padding: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .usuarios-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .usuarios-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(178,31,31,0.3);
        }

        .table {
          border-radius: 10px;
          overflow: hidden;
          background: white;
        }

        .table th {
          background: #f8f9fa;
          color: #343a40;
          font-weight: 600;
        }

        .table tbody tr:hover {
          background-color: #f1f1f1;
          transition: background 0.3s ease;
        }

        .form-control {
          border-radius: 10px;
          border: 1px solid #dee2e6;
          transition: border-color 0.3s;
        }

        .form-control:focus {
          border-color: #b21f1f;
          box-shadow: 0 0 0 0.2rem rgba(178,31,31,0.25);
        }

        h5 {
          font-weight: 600;
          margin-bottom: 1rem;
        }
      `}</style>

      {/* 🔹 Encabezado */}
      <div className="usuarios-header">
        <i className="fas fa-users fa-3x mb-3"></i>
        <h2>Gestión de Usuarios</h2>
        <p>Administra los usuarios registrados dentro del sistema de votación.</p>
      </div>

      {/* 🔹 Formulario de creación */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Crear nuevo usuario</h5>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Teléfono (opcional)"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>
            <div className="col-12 mt-3 text-end">
              <button className="btn btn-primary px-4" onClick={handleCrearUsuario}>
                <i className="fas fa-user-plus me-2"></i>
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Tabla de usuarios */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Usuarios registrados</h5>

          {loading ? (
            <div className="text-center mt-3">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="text-center text-muted mt-3">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-hover align-middle text-center">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>{u.nombre}</td>
                      <td>{u.telefono || "—"}</td>
                      <td>{u.fecha ? new Date(u.fecha).toLocaleDateString() : "—"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(u.id_usuario, u.nombre)}
                        >
                          <i className="fas fa-trash-alt me-1"></i>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Modal de alertas */}
      <ModalAlert
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
