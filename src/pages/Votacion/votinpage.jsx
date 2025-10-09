import React, { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeVote, setActiveVote] = useState(null);
  const [rondaActiva, setRondaActiva] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // 🔁 Obtener datos de votación y candidatos (incluyendo Voto Nulo)
  const fetchCandidatos = async () => {
    try {
      // 🔹 Buscar votación activa
      const { data: votacion, error: errorV } = await supabase
        .from("votacion")
        .select("id_votacion, titulo, estado")
        .eq("estado", "Activa")
        .single();

      if (errorV || !votacion) {
        console.warn("⚠️ No hay votación activa:", errorV?.message);
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
        console.warn("⚠️ No hay ronda activa");
        setRondaActiva(null);
        setCandidates([]);
        return;
      }

      setRondaActiva(ronda);

      // 🔹 Traer candidatos sin cargo + el voto nulo
      const { data, error } = await supabase
        .from("candidato")
        .select("id_candidato, nombre, id_cargo")
        .eq("id_votacion", votacion.id_votacion)
        .or("id_cargo.is.null,nombre.eq.Voto Nulo"); // ✅ incluye el nulo

      if (error) {
        console.error("❌ Error cargando candidatos:", error.message);
        return;
      }

      // 🔹 Formatear datos para mostrar
      const formatted = data.map((c) => ({
        id: c.id_candidato,
        name: c.nombre,
        description:
          c.nombre === "Voto Nulo"
            ? "Opción de voto nulo"
            : "Candidato activo",
        color: c.nombre === "Voto Nulo" ? "#6c757d" : "#007bff",
        icon: c.nombre === "Voto Nulo" ? "🚫" : "🗳️",
      }));

      setCandidates(formatted);
    } catch (err) {
      console.error("Error general en fetchCandidatos:", err.message);
    }
  };

  // 🔁 Actualizar automáticamente cada 2 segundos
  useEffect(() => {
    fetchCandidatos();
    const interval = setInterval(fetchCandidatos, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🗳️ Enviar voto (soporta voto nulo)
  const handleEnviarVoto = async () => {
    if (!selectedCandidate) {
      alert("⚠️ Selecciona un candidato o voto nulo antes de votar.");
      return;
    }
    if (!activeVote || !rondaActiva) {
      alert("⚠️ No hay votación o ronda activa.");
      return;
    }

    setIsSending(true);

    // Buscar si el voto es nulo
    const candidatoSeleccionado = candidates.find(
      (c) => c.id === selectedCandidate
    );
    const esVotoNulo = candidatoSeleccionado?.name === "Voto Nulo";

    // Registrar el voto
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
      alert("❌ Error al registrar el voto. Intenta nuevamente.");
    } else {
      alert("✅ ¡Voto registrado correctamente!");
      setSelectedCandidate(null); // 🔄 Limpia selección
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
    </div>
  );
}

export default VotingPage;
