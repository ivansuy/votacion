import React, { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

// 🧩 Modal elegante
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

function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeVote, setActiveVote] = useState(null);
  const [rondaActiva, setRondaActiva] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Modal
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

  // 🔁 Cargar votación y candidatos
  const fetchCandidatos = async () => {
    try {
      const { data: votacion } = await supabase
        .from("votacion")
        .select("id_votacion, titulo, estado")
        .eq("estado", "Activa")
        .single();

      if (!votacion) {
        setCandidates([]);
        setActiveVote(null);
        setRondaActiva(null);
        return;
      }

      setActiveVote(votacion.id_votacion);

      const { data: ronda } = await supabase
        .from("ronda")
        .select("id_ronda, numero_de_ronda, estado")
        .eq("votacion_id", votacion.id_votacion)
        .eq("estado", "En curso")
        .single();

      if (!ronda) {
        setRondaActiva(null);
        setCandidates([]);
        return;
      }

      setRondaActiva(ronda);

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

      // 🔹 Mantener "Voto Nulo" siempre al final
      const sorted = data.sort((a, b) => {
        if (a.nombre.toLowerCase() === "voto nulo") return 1;
        if (b.nombre.toLowerCase() === "voto nulo") return -1;
        return a.nombre.localeCompare(b.nombre);
      });

      const formatted = sorted.map((c) => ({
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
          {/* 📋 Lista vertical de candidatos */}
          <ul className="list-group mb-4 shadow-sm">
            {candidates.map((candidate) => (
              <li
                key={candidate.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  selectedCandidate === candidate.id ? "list-group-item-success" : ""
                }`}
                style={{
                  cursor: "pointer",
                  transition: "0.3s",
                  fontWeight: candidate.name === "Voto Nulo" ? "bold" : "normal",
                }}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="fs-4"
                    style={{
                      color: candidate.name === "Voto Nulo" ? "#6c757d" : "#007bff",
                    }}
                  >
                    {candidate.icon}
                  </span>
                  <div>
                    <div
                      className={`fw-semibold ${
                        candidate.name === "Voto Nulo" ? "text-secondary" : ""
                      }`}
                    >
                      {candidate.name.toUpperCase()}
                    </div>
                    <small
                      className={`${
                        candidate.name === "Voto Nulo"
                          ? "text-muted"
                          : "text-primary"
                      }`}
                    >
                      {candidate.description}
                    </small>
                  </div>
                </div>

                {/* Estado visual */}
                {selectedCandidate === candidate.id ? (
                  <span className="badge bg-success">✅ Seleccionado</span>
                ) : candidate.name === "Voto Nulo" ? (
                  <span className="badge bg-secondary">Voto nulo</span>
                ) : (
                  <span className="badge bg-primary">Activo</span>
                )}
              </li>
            ))}
          </ul>

          {/* 🔘 Botón enviar voto */}
          <div className="text-center mt-4">
            <button
              className="btn btn-primary w-100 py-2"
              onClick={handleEnviarVoto}
              disabled={isSending}
            >
              {isSending ? "Enviando voto..." : "🗳️ Enviar voto"}
            </button>
          </div>
        </>
      )}

      {/* Modal de mensajes */}
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
