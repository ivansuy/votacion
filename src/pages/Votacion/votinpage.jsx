import React, { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

// 🧩 Modal elegante tipo tarjeta (como el resto del sistema)
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
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 2000,
      }}
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

function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeVote, setActiveVote] = useState(null);
  const [rondaActiva, setRondaActiva] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Estado del modal
  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
  });

  const showModal = (type, title, message) => {
    setModal({ show: true, type, title, message });
  };
  const closeModal = () => setModal({ ...modal, show: false });

  // 🔁 Obtener datos de votación y candidatos
  const fetchCandidatos = async () => {
    try {
      // 🔹 Buscar votación activa
      const { data: votacion, error: errorV } = await supabase
        .from("votacion")
        .select("id_votacion, titulo, estado")
        .eq("estado", "Activa")
        .single();

      if (errorV || !votacion) {
        setCandidates([]);
        setActiveVote(null);
        setRondaActiva(null);
        return;
      }

      setActiveVote(votacion.id_votacion);

      // 🔹 Buscar ronda activa
      const { data: ronda, error: errRonda } = await supabase
        .from("ronda")
        .select("id_ronda, numero_de_ronda, estado")
        .eq("votacion_id", votacion.id_votacion)
        .eq("estado", "En curso")
        .single();

      if (!ronda || errRonda) {
        setRondaActiva(null);
        setCandidates([]);
        return;
      }

      setRondaActiva(ronda);

      // 🔹 Traer candidatos sin cargo + voto nulo
      const { data, error } = await supabase
        .from("candidato")
        .select("id_candidato, nombre, id_cargo")
        .eq("id_votacion", votacion.id_votacion)
        .or("id_cargo.is.null,nombre.eq.Voto Nulo");

      if (error) {
        console.error("❌ Error cargando candidatos:", error.message);
        showModal("error", "Error", "No se pudieron cargar los candidatos.");
        return;
      }

      // 🔹 Formatear candidatos
      const formatted = data.map((c) => ({
        id: c.id_candidato,
        name: c.nombre,
        description:
          c.nombre === "Voto Nulo" ? "Opción de voto nulo" : "Candidato activo",
        color: c.nombre === "Voto Nulo" ? "#6c757d" : "#007bff",
        icon: c.nombre === "Voto Nulo" ? "🚫" : "🗳️",
      }));

      setCandidates(formatted);
    } catch (err) {
      console.error("Error general en fetchCandidatos:", err.message);
      showModal("error", "Error", "No se pudo conectar con el servidor.");
    }
  };

  // 🔁 Actualizar cada 2 segundos
  useEffect(() => {
    fetchCandidatos();
    const interval = setInterval(fetchCandidatos, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🗳️ Enviar voto
  const handleEnviarVoto = async () => {
    if (!selectedCandidate) {
      showModal("warning", "Candidato no seleccionado", "Selecciona un candidato o voto nulo antes de votar.");
      return;
    }

    if (!activeVote || !rondaActiva) {
      showModal("warning", "Votación no disponible", "No hay una votación o ronda activa en este momento.");
      return;
    }

    setIsSending(true);

    const candidatoSeleccionado = candidates.find((c) => c.id === selectedCandidate);
    const esVotoNulo = candidatoSeleccionado?.name === "Voto Nulo";

    const { error } = await supabase.from("voto").insert([
      {
        id_votacion: activeVote,
        id_ronda: rondaActiva.id_ronda,
        id_candidato: esVotoNulo ? null : selectedCandidate,
        es_nulo: esVotoNulo,
        fecha: new Date(),
      },
    ]);

    setIsSending(false);

    if (error) {
      console.error("❌ Error al registrar voto:", error.message);
      showModal("error", "Error al votar", "Ocurrió un error al registrar tu voto. Intenta nuevamente.");
    } else {
      showModal("success", "Voto Registrado", "¡Tu voto fue registrado correctamente!");
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">
        🕊️ Sistema de Votación - Iglesia Sendero de la Cruz
      </h2>

      {candidates.length === 0 ? (
        <p className="text-center text-muted">
          No hay candidatos activos en este momento.
        </p>
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-center mt-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`card m-2 text-center shadow ${
                  selectedCandidate === candidate.id ? "border-success" : ""
                }`}
                style={{
                  width: "14rem",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div
                  className={`card-body ${
                    candidate.name === "Voto Nulo"
                      ? "bg-secondary text-white"
                      : selectedCandidate === candidate.id
                      ? "bg-success text-white"
                      : "bg-primary text-white"
                  } rounded-top`}
                >
                  <h5 className="card-title text-uppercase">
                    {candidate.icon} {candidate.name}
                  </h5>
                </div>
                <div className="card-footer bg-light">
                  {selectedCandidate === candidate.id ? (
                    <span className="badge bg-success">✅ Seleccionado</span>
                  ) : (
                    <span
                      className={`badge ${
                        candidate.name === "Voto Nulo"
                          ? "bg-secondary"
                          : "bg-primary"
                      }`}
                    >
                      {candidate.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 🔘 Botón enviar voto */}
          <div className="text-center mt-4">
            <button
              className="btn btn-primary w-100"
              onClick={handleEnviarVoto}
              disabled={isSending}
            >
              {isSending ? "Enviando voto..." : "🗳️ Enviar voto"}
            </button>
          </div>
        </>
      )}

      {/* Modal elegante de mensajes */}
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

export default VotingPage;
