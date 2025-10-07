import { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

export default function CrearVotacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [totalVotantes, setTotalVotantes] = useState("");
  const [candidatos, setCandidatos] = useState([]);
  const [nuevoCandidato, setNuevoCandidato] = useState("");
  const [votacionActiva, setVotacionActiva] = useState(null);

  // 🔹 Verificar si hay votación activa
  useEffect(() => {
    const fetchData = async () => {
      const { data: activaData, error } = await supabase
        .from("votacion")
        .select("*")
        .eq("estado", "Activa")
        .order("fecha_inicio", { ascending: false })
        .limit(1);

      if (error) console.error("Error buscando votación activa:", error);
      if (activaData && activaData.length > 0) {
        setVotacionActiva(activaData[0]);
      }
    };
    fetchData();
  }, []);

  // 🔹 Agregar candidato temporalmente
  const handleAgregarCandidato = () => {
    if (nuevoCandidato.trim() === "") return;
    setCandidatos([...candidatos, { nombre: nuevoCandidato }]);
    setNuevoCandidato("");
  };

  // 🔹 Crear votación + candidatos + primera ronda
  const handleCrearVotacion = async () => {
    try {
      if (votacionActiva) {
        alert(
          `⚠️ Ya existe una votación activa (${votacionActiva.titulo}). Cierra esa votación antes de crear otra.`
        );
        return;
      }

      if (!titulo || !totalVotantes) {
        alert("⚠️ Debes completar el título y el número de votantes esperados.");
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
        alert("❌ Error al crear la votación: " + votacionError.message);
        return;
      }

      const votacionId = votacionData.id_votacion;

      // 👥 Insertar candidatos
      if (candidatos.length > 0) {
        const lista = candidatos.map((c) => ({
          nombre: c.nombre,
          id_votacion: votacionId,
        }));

        const { error: errorCand } = await supabase
          .from("candidato")
          .insert(lista);

        if (errorCand)
          alert("⚠️ Error al guardar candidatos: " + errorCand.message);
      }

      // 🔄 Crear primera ronda automáticamente (usando estructura real)
      const { error: errorRonda } = await supabase.from("ronda").insert([
        {
          votacion_id: votacionId, // ✅ nombre real del campo FK
          cargo_id: null, // ✅ se establece como null explícitamente
          numero_de_ronda: 1, // ✅ nombre correcto
          estado: "En curso",
          fecha_inicio: new Date(),
        },
      ]);

      if (errorRonda)
        console.error("❌ Error creando primera ronda:", errorRonda.message);
      else alert("✅ Votación creada con su primera ronda activa.");

      // 🧹 Limpiar formulario
      setTitulo("");
      setDescripcion("");
      setTotalVotantes("");
      setCandidatos([]);
    } catch (e) {
      console.error("❌ Error general:", e.message);
      alert("Ocurrió un error inesperado al crear la votación.");
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
                {c.nombre}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
