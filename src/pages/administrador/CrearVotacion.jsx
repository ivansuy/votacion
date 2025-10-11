import { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

// 🧩 Modal elegante (tipo tarjeta)
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
        style={{ width: "420px", borderRadius: "10px" }}
      >
        <div className={`card-header fw-bold ${colors[type]}`}>
          {icons[type]} {title}
        </div>
        <div className="card-body">
          <p className="fs-6">{message}</p>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-success px-4" onClick={onClose}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearVotacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [totalVotantes, setTotalVotantes] = useState("");
  const [candidatos, setCandidatos] = useState([]);
  const [nuevoCandidato, setNuevoCandidato] = useState("");
  const [votacionActiva, setVotacionActiva] = useState(null);

  // 🔔 Modal state
  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
  });

  const showModal = (type, title, message) =>
    setModal({ show: true, type, title, message });
  const closeModal = () => setModal({ ...modal, show: false });

  // 🔹 Verificar si hay votación activa
  useEffect(() => {
    const fetchData = async () => {
      const { data: activaData, error } = await supabase
        .from("votacion")
        .select("*")
        .eq("estado", "Activa")
        .order("fecha_inicio", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error buscando votación activa:", error);
        showModal("error", "Error", "No se pudo verificar la votación activa.");
      }

      if (activaData && activaData.length > 0) {
        setVotacionActiva(activaData[0]);
      }
    };
    fetchData();
  }, []);

  // 🔹 Agregar candidato temporalmente
  const handleAgregarCandidato = () => {
    if (nuevoCandidato.trim() === "") {
      showModal("warning", "Campo vacío", "Debes ingresar un nombre para el candidato.");
      return;
    }

    // Evitar duplicados
    if (candidatos.some(c => c.nombre.toLowerCase() === nuevoCandidato.toLowerCase())) {
      showModal("warning", "Duplicado", "Este candidato ya fue agregado.");
      return;
    }

    setCandidatos([...candidatos, { nombre: nuevoCandidato }]);
    showModal("success", "Candidato Agregado", `Se agregó a ${nuevoCandidato} correctamente.`);
    setNuevoCandidato("");
  };

  // 🔹 Eliminar candidato antes de crear la votación
  const handleEliminarCandidato = (index) => {
    const nombreEliminado = candidatos[index].nombre;
    const listaActualizada = candidatos.filter((_, i) => i !== index);
    setCandidatos(listaActualizada);
    showModal("info", "Candidato Eliminado", `Se eliminó a ${nombreEliminado} de la lista.`);
  };

  // 🔹 Crear votación + candidatos + ronda + voto nulo
  const handleCrearVotacion = async () => {
    try {
      if (votacionActiva) {
        showModal(
          "warning",
          "Votación activa existente",
          `Ya existe una votación activa (${votacionActiva.titulo}). Debes cerrarla antes de crear otra.`
        );
        return;
      }

      if (!titulo || !totalVotantes) {
        showModal(
          "warning",
          "Campos incompletos",
          "Debes completar el título y el número de votantes esperados."
        );
        return;
      }

      if (candidatos.length < 3) {
        showModal(
          "warning",
          "Faltan candidatos",
          "Debes agregar al menos 3 candidatos antes de crear la votación."
        );
        return;
      }

      // 🗳️ Crear votación
      const { data: votacionData, error: votacionError } = await supabase
        .from("votacion")
        .insert([
          {
            titulo,
            descripcion,
            total_votantes: parseInt(totalVotantes),
            estado: "Activa",
            fecha_inicio: new Date(),
          },
        ])
        .select()
        .single();

      if (votacionError) {
        showModal("error", "Error", "No se pudo crear la votación.");
        return;
      }

      const votacionId = votacionData.id_votacion;

      // 👥 Insertar candidatos
      const lista = candidatos.map((c) => ({
        nombre: c.nombre,
        id_votacion: votacionId,
      }));

      const { error: errorCand } = await supabase.from("candidato").insert(lista);
      if (errorCand) {
        showModal("warning", "Error al guardar", "Ocurrió un problema al guardar los candidatos.");
        return;
      }

      // 🚫 Agregar “Voto Nulo”
      await supabase.from("candidato").insert([
        { nombre: "Voto Nulo", id_votacion: votacionId },
      ]);

      // 🔄 Crear primera ronda automáticamente
      await supabase.from("ronda").insert([
        {
          votacion_id: votacionId,
          cargo_id: null,
          numero_de_ronda: 1,
          estado: "En curso",
          fecha_inicio: new Date(),
        },
      ]);

      showModal(
        "success",
        "Votación Creada",
        "La votación fue creada exitosamente con su primera ronda y voto nulo."
      );

      // 🧹 Limpiar formulario
      setTitulo("");
      setDescripcion("");
      setTotalVotantes("");
      setCandidatos([]);
    } catch (e) {
      console.error("❌ Error general:", e.message);
      showModal("error", "Error inesperado", "Ocurrió un error al crear la votación.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>🗳️ Crear Votación</h2>

      {votacionActiva ? (
        <div className="alert alert-warning mt-3">
          ⚠️ Ya existe una votación activa:{" "}
          <strong>{votacionActiva.titulo}</strong>. Cierra esa votación desde{" "}
          <b>Gestión de Votación</b> antes de crear una nueva.
        </div>
      ) : (
        <>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Título de la votación"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Descripción de la votación"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            type="number"
            className="form-control mb-3"
            placeholder="Número de votantes esperados"
            value={totalVotantes}
            onChange={(e) => setTotalVotantes(e.target.value)}
          />

          <button
            onClick={handleCrearVotacion}
            className="btn btn-primary mb-4 w-100"
          >
            Crear Votación
          </button>

          <h4>🧑‍🤝‍🧑 Candidatos</h4>
          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Nombre del candidato"
              value={nuevoCandidato}
              onChange={(e) => setNuevoCandidato(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleAgregarCandidato}>
              Agregar
            </button>
          </div>

          <ul className="list-group">
            {candidatos.map((c, i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{c.nombre}</span>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleEliminarCandidato(i)}
                >
                  🗑️ Eliminar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Modal elegante */}
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
