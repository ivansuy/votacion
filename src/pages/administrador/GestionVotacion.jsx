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

  // 🔁 Repetir ronda (pendiente)
  const handleRepetirRonda = () => {
    alert("🔁 Función de repetir ronda aún no implementada");
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
              <button
                className="btn btn-warning text-white"
                onClick={handleRepetirRonda}
              >
                🔁 Repetir Ronda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
