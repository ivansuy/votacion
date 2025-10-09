import { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";

export default function GestionVotacion() {
  const [votacionActiva, setVotacionActiva] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Cargar la votación activa, sus candidatos y cargos disponibles
  const fetchVotacionActiva = async () => {
    setLoading(true);

    // Votación activa
    const { data: votaciones, error } = await supabase
      .from("votacion")
      .select("id_votacion, titulo, descripcion, total_votantes, fecha_inicio, estado")
      .eq("estado", "Activa");

    if (error) {
      console.error("❌ Error cargando votaciones:", error.message);
      setLoading(false);
      return;
    }

    if (votaciones.length === 0) {
      setVotacionActiva(null);
      setCandidatos([]);
      setLoading(false);
      return;
    }

    const activa = votaciones[0];
    setVotacionActiva(activa);

    // Candidatos
    const { data: listaCandidatos, error: errorC } = await supabase
      .from("candidato")
      .select("id_candidato, nombre, id_cargo")
      .eq("id_votacion", activa.id_votacion);

    if (errorC) {
      console.error("Error cargando candidatos:", errorC.message);
    } else {
      setCandidatos(listaCandidatos);
    }

    // Cargos
    const { data: listaCargos, error: errorCar } = await supabase
      .from("cargo")
      .select("id_cargo, nombre_cargo");

    if (errorCar) {
      console.error("Error cargando cargos:", errorCar.message);
    } else {
      setCargos(listaCargos);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVotacionActiva();
  }, []);

  // 🧑‍💼 Asignar cargo a candidato
  const handleAsignarCargo = async (idCandidato, idCargo) => {
    if (!idCargo) return;
    const { error } = await supabase
      .from("candidato")
      .update({ id_cargo: idCargo })
      .eq("id_candidato", idCandidato);

    if (error) {
      alert("❌ Error asignando cargo: " + error.message);
    } else {
      alert("✅ Cargo asignado correctamente");
      fetchVotacionActiva(); // refrescar datos
    }
  };

  // 🏁 Cerrar votación
  const handleCerrarVotacion = async () => {
    if (!votacionActiva) return;
    if (!confirm("¿Seguro que deseas cerrar esta votación?")) return;

    const { error } = await supabase
      .from("votacion")
      .update({
        estado: "Cerrada",
        fecha_cierre: new Date(),
      })
      .eq("id_votacion", votacionActiva.id_votacion);

    if (error) {
      alert("❌ Error cerrando la votación: " + error.message);
      return;
    }

    alert("✅ Votación cerrada correctamente.");
    setVotacionActiva(null);
    setCandidatos([]);
  };

// 🔁 Repetir Ronda
const handleRepetirRonda = async () => {
  if (!votacionActiva) {
    alert("⚠️ No hay votación activa para repetir la ronda.");
    return;
  }

  try {
    // 1️⃣ Obtener la ronda actual
    const { data: rondaActual, error: errorRonda } = await supabase
      .from("ronda")
      .select("*")
      .eq("votacion_id", votacionActiva.id_votacion)
      .eq("estado", "En curso")
      .single();

    if (errorRonda || !rondaActual) {
      alert("⚠️ No hay ronda activa para repetir.");
      return;
    }

    // 2️⃣ Cerrar la ronda actual
    const { error: cerrarError } = await supabase
      .from("ronda")
      .update({ estado: "Finalizada", fecha_cierre: new Date() })
      .eq("id_ronda", rondaActual.id_ronda);

    if (cerrarError) {
      alert("❌ Error al cerrar la ronda actual.");
      return;
    }

    // 3️⃣ Crear nueva ronda (incrementa número)
    const nuevoNumero = (rondaActual.numero_de_ronda || 1) + 1;
    const { error: crearError } = await supabase.from("ronda").insert([
      {
        votacion_id: votacionActiva.id_votacion,
        cargo_id: null,
        numero_de_ronda: nuevoNumero,
        estado: "En curso",
        fecha_inicio: new Date(),
      },
    ]);

    if (crearError) {
      alert("❌ Error al crear la nueva ronda.");
      return;
    }

    // 4️⃣ Limpiar votos anteriores
    const { error: borrarError } = await supabase
      .from("voto")
      .delete()
      .eq("id_votacion", votacionActiva.id_votacion);

    if (borrarError) {
      console.error("Error limpiando votos:", borrarError.message);
    }

    alert(`✅ Se ha creado la Ronda ${nuevoNumero} y los votos fueron reiniciados.`);
  } catch (e) {
    console.error("❌ Error general al repetir ronda:", e.message);
  }
};

  if (loading) {
    return <div className="text-center mt-5">Cargando votación activa...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>🗳️ Gestión de Votación</h2>
      <hr />

      {!votacionActiva ? (
        <div className="alert alert-info">
          No hay ninguna votación activa actualmente.
        </div>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="mb-2">{votacionActiva.titulo}</h4>
            <p className="text-muted mb-1">{votacionActiva.descripcion}</p>
            <p>
              <strong>Estado:</strong> {votacionActiva.estado} <br />
              <strong>Votantes esperados:</strong>{" "}
              {votacionActiva.total_votantes} <br />
              <strong>Fecha inicio:</strong>{" "}
              {new Date(votacionActiva.fecha_inicio).toLocaleDateString()}
            </p>

            <h5 className="mt-4">🧑‍🤝‍🧑 Candidatos</h5>
            <ul className="list-group mb-4">
              {candidatos.map((c) => (
                <li
                  key={c.id_candidato}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{c.nombre}</span>
                  <select
                    className="form-select w-auto"
                    value={c.id_cargo || ""}
                    onChange={(e) =>
                      handleAsignarCargo(c.id_candidato, e.target.value)
                    }
                  >
                    <option value="">Sin cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id_cargo} value={cargo.id_cargo}>
                        {cargo.nombre_cargo}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>

            <div className="d-flex gap-3">
              <button
                className="btn btn-danger"
                onClick={handleCerrarVotacion}
              >
                🔒 Cerrar Votación
              </button>
          <button className="btn btn-warning" onClick={handleRepetirRonda}>
          🔁 Repetir Ronda
          </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
