import { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

export default function CrearVotacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [totalVotantes, setTotalVotantes] = useState("");
  const [candidatos, setCandidatos] = useState([]);
  const [nuevoCandidato, setNuevoCandidato] = useState("");
  const [cargos, setCargos] = useState([]);

  // cargar cargos desde Supabase
  useEffect(() => {
    const fetchCargos = async () => {
      const { data, error } = await supabase.from("cargo").select("*");
      if (!error) setCargos(data);
      else console.error("Error cargando cargos:", error.message);
    };
    fetchCargos();
  }, []);

  // crear votación + guardar candidatos
  const handleCrearVotacion = async () => {
    if (!titulo || !totalVotantes) {
      alert("⚠️ Completa los datos de la votación");
      return;
    }

    const { data, error } = await supabase
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
      .select();

    if (error) {
      alert("❌ Error creando votación: " + error.message);
      return;
    }

    const nuevaVotacion = data[0];
    alert("✅ Votación creada correctamente");

    // insertar candidatos vinculados
    if (candidatos.length > 0) {
      const nuevosCandidatos = candidatos.map((c) => ({
        nombre: c.nombre,
        id_cargo: c.cargo || null,
        id_votacion: nuevaVotacion.id_votacion,
        descripcion: "Candidato para cargo asignado",
      }));

      const { error: errCand } = await supabase
        .from("candidato")
        .insert(nuevosCandidatos);

      if (errCand)
        alert("⚠️ Error guardando candidatos: " + errCand.message);
      else alert("✅ Candidatos guardados correctamente");
    }

    // limpiar formulario
    setTitulo("");
    setDescripcion("");
    setTotalVotantes("");
    setCandidatos([]);
  };

  const handleAgregarCandidato = () => {
    if (nuevoCandidato.trim() === "") return;
    setCandidatos([...candidatos, { nombre: nuevoCandidato, cargo: null }]);
    setNuevoCandidato("");
  };

  const handleAsignarCargo = (index, cargoId) => {
    const updated = [...candidatos];
    updated[index].cargo = cargoId;
    setCandidatos(updated);
  };

  return (
    <div className="container mt-5">
      <h2>🗳️ Crear Votación</h2>

      {/* Datos principales */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Título de la votación"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <textarea
        className="form-control mb-2"
        placeholder="Descripción"
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

      <button onClick={handleCrearVotacion} className="btn btn-primary mb-4">
        Crear Votación
      </button>

      {/* Candidatos */}
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
        {candidatos.map((candidato, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {candidato.nombre}
            <select
              className="form-select w-auto"
              value={candidato.cargo || ""}
              onChange={(e) => handleAsignarCargo(index, e.target.value)}
            >
              <option value="">Asignar Cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id_cargo} value={cargo.id_cargo}>
                  {cargo.nombre_cargo}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
