import React, { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeVote, setActiveVote] = useState(null);
  const [rondaActiva, setRondaActiva] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // 🔄 Obtener candidatos activos de la votación y ronda actual
  const fetchCandidatos = async () => {
    const { data: votacion, error: errorV } = await supabase
      .from("votacion")
      .select("id_votacion")
      .eq("estado", "Activa")
      .single();

    if (errorV || !votacion) {
      console.warn("⚠️ No hay votación activa:", errorV?.message);
      setCandidates([]);
      return;
    }

    setActiveVote(votacion.id_votacion);

    // 🔹 Buscar ronda activa
    const { data: ronda, error: errRonda } = await supabase
      .from("ronda")
      .select("id_ronda")
      .eq("id_votacion", votacion.id_votacion)
      .eq("estado", "En curso")
      .single();

    if (ronda) setRondaActiva(ronda.id_ronda);

    // 🔹 Traer candidatos sin cargo
    const { data, error } = await supabase
      .from("candidato")
      .select("id_candidato, nombre, id_cargo")
      .eq("id_votacion", votacion.id_votacion)
      .is("id_cargo", null);

    if (error) {
      console.error("Error cargando candidatos:", error.message);
      return;
    }

    const formatted = data.map((c) => ({
      id: c.id_candidato,
      name: c.nombre,
      description: "Candidato activo",
      color: "#1a2a6c",
      icon: "🗳️",
    }));

    setCandidates(formatted);
  };

  // 🧠 Actualizar automáticamente cada 3 segundos
  useEffect(() => {
    fetchCandidatos();
    const interval = setInterval(fetchCandidatos, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🗳️ Enviar voto
  const handleEnviarVoto = async () => {
    if (!selectedCandidate) {
      alert("⚠️ Selecciona un candidato antes de votar.");
      return;
    }
    if (!activeVote || !rondaActiva) {
      alert("⚠️ No hay votación o ronda activa.");
      return;
    }

    setIsSending(true);
    const { error } = await supabase.from("voto").insert([
      {
        id_votacion: activeVote,
        id_candidato: selectedCandidate,
        id_ronda: rondaActiva,
        fecha: new Date(),
      },
    ]);

    setIsSending(false);

    if (error) {
      console.error("❌ Error al registrar voto:", error.message);
      alert("❌ Error al registrar el voto. Intenta nuevamente.");
    } else {
      alert("✅ Voto registrado correctamente.");
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        🕊️ Sistema de Votación - Iglesia Sendero de la Cruz
      </h1>

      {candidates.length === 0 ? (
        <p className="text-center text-muted">
          No hay candidatos activos en este momento.
        </p>
      ) : (
        <>
          <div className="row">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="col-md-4 mb-4">
                <div
                  className="card shadow-sm"
                  style={{
                    border:
                      selectedCandidate === candidate.id
                        ? `3px solid ${candidate.color}`
                        : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div
                    className="card-header text-center text-white"
                    style={{ backgroundColor: candidate.color }}
                  >
                    <span style={{ fontSize: "2rem" }}>{candidate.icon}</span>
                  </div>
                  <div className="card-body text-center">
                    <h5>{candidate.name}</h5>
                    <p>{candidate.description}</p>
                    {selectedCandidate === candidate.id && (
                      <span className="badge bg-success">✅ Seleccionado</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🔘 Botón global para enviar voto */}
          <div className="text-center mt-4">
            <button
              className="btn btn-primary px-5"
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
