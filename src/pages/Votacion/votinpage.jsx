import React, { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // obtener candidatos de la votación activa
  useEffect(() => {
    const fetchCandidatos = async () => {
      const { data: votacion } = await supabase
        .from("votacion")
        .select("id_votacion")
        .eq("estado", "Activa")
        .single();

      if (!votacion) return;

      const { data, error } = await supabase
        .from("candidato")
        .select("id_candidato, nombre, descripcion, cargo(nombre_cargo)")
        .eq("id_votacion", votacion.id_votacion);

      if (error) {
        console.error("Error cargando candidatos:", error.message);
        return;
      }

      const formatted = data.map((c) => ({
        id: c.id_candidato,
        name: c.nombre,
        description:
          c.descripcion ||
          `Candidato para el cargo ${c.cargo?.nombre_cargo || ""}`,
        color: "#1a2a6c",
        icon: "🗳️",
      }));

      setCandidates(formatted);
    };

    fetchCandidatos();
  }, []);

  const handleVote = (id) => setSelectedCandidate(id);

  const confirmVote = () => {
    const selected = candidates.find((c) => c.id === selectedCandidate);
    if (selected) {
      alert(`✅ Has votado por ${selected.name}`);
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        🕊️ Sistema de Votación - Iglesia Sendero de la Cruz
      </h1>

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
              }}
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
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleVote(candidate.id)}
                >
                  {selectedCandidate === candidate.id
                    ? "✅ Seleccionado"
                    : "🗳️ Votar"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <div className="text-center mt-4">
          <button className="btn btn-success me-2" onClick={confirmVote}>
            Confirmar voto
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedCandidate(null)}
          >
            Cambiar selección
          </button>
        </div>
      )}
    </div>
  );
}

export default VotingPage;
