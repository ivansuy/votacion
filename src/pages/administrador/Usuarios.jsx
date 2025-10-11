import { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";

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
        style={{ width: "420px", borderRadius: "10px" }}
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

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");

  // 🔹 Estado para el modal
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

  // 🔹 Cargar usuarios
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

  // 🔹 Crear usuario
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

  // 🔹 Eliminar usuario
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
    <div className="container py-4">
      <h3>Gestión de Usuarios</h3>

      {/* Formulario */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5>Crear Usuario</h5>
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
            <div className="col-12 mt-3">
              <button className="btn btn-primary" onClick={handleCrearUsuario}>
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card shadow-sm">
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
              <table className="table table-hover align-middle">
                <thead className="table-light">
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
                      <td>
                        {u.fecha
                          ? new Date(u.fecha).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(u.id_usuario, u.nombre)}
                        >
                          🗑️ Eliminar
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

      {/* Modal global de alertas */}
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
