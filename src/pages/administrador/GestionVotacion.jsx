import { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";

function ModalAlert({ show, type, title, message, onClose, onConfirm }) {
  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    confirm: "❓",
  };

  const colors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-primary text-white",
    confirm: "bg-secondary text-white",
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
          <div className="d-flex justify-content-center gap-3 mt-3">
            {type === "confirm" ? (
              <>
                <button
                  className="btn btn-success px-4"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Confirmar
                </button>
                <button className="btn btn-secondary px-4" onClick={onClose}>
                  Cancelar
                </button>
              </>
            ) : (
              <button className="btn btn-success px-4" onClick={onClose}>
                Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GestionVotacion() {
  const [votacionActiva, setVotacionActiva] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [nuevoCandidato, setNuevoCandidato] = useState("");
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showModal = (type, title, message, onConfirm = null) =>
    setModal({ show: true, type, title, message, onConfirm });
  const closeModal = () => setModal({ ...modal, show: false });

  const fetchVotacionActiva = async () => {
    setLoading(true);

    const { data: votaciones } = await supabase
      .from("votacion")
      .select("*")
      .eq("estado", "Activa");

    if (!votaciones?.length) {
      setVotacionActiva(null);
      setCandidatos([]);
      setLoading(false);
      return;
    }

    const activa = votaciones[0];
    setVotacionActiva(activa);

    const { data: listaCandidatos } = await supabase
      .from("candidato")
      .select("id_candidato, nombre, id_cargo")
      .eq("id_votacion", activa.id_votacion);

    const { data: listaCargos } = await supabase
      .from("cargo")
      .select("id_cargo, nombre_cargo");

    setCandidatos(listaCandidatos || []);
    setCargos(listaCargos || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVotacionActiva();
  }, []);

  // ➕ Agregar candidato
  const handleAgregarCandidato = async () => {
    if (!nuevoCandidato.trim()) {
      showModal("warning", "Campo vacío", "Debes ingresar un nombre de candidato.");
      return;
    }

    if (!votacionActiva) {
      showModal("error", "Sin votación activa", "No hay una votación activa.");
      return;
    }

    const { data, error } = await supabase
      .from("candidato")
      .insert([{ nombre: nuevoCandidato.trim(), id_votacion: votacionActiva.id_votacion }])
      .select();

    if (error) {
      showModal("error", "Error", "No se pudo agregar el candidato.");
      return;
    }

    const nuevo = data[0];
    setNuevoCandidato("");

    // Mantener “Voto Nulo” al final
    setCandidatos((prev) => {
      const votoNulo = prev.find((c) => c.nombre.toLowerCase() === "voto nulo");
      const otros = prev.filter((c) => c.nombre.toLowerCase() !== "voto nulo");
      const nuevaLista = votoNulo ? [...otros, nuevo, votoNulo] : [...prev, nuevo];
      return nuevaLista;
    });

    showModal("success", "Candidato Agregado", "El candidato fue agregado correctamente.");
  };

  // 🗑️ Eliminar candidato (solo si no tiene cargo)
  const handleEliminarCandidato = (idCandidato, nombre, idCargo) => {
    if (nombre.toLowerCase() === "voto nulo") {
      showModal("warning", "No permitido", "No puedes eliminar el candidato 'Voto Nulo'.");
      return;
    }

    if (idCargo) {
      showModal(
        "warning",
        "No permitido",
        `No puedes eliminar a ${nombre}, ya tiene un cargo asignado.`
      );
      return;
    }

    showModal(
      "confirm",
      "Eliminar Candidato",
      `¿Deseas eliminar a ${nombre}?`,
      async () => {
        const { error } = await supabase.from("candidato").delete().eq("id_candidato", idCandidato);
        if (error) {
          showModal("error", "Error", "No se pudo eliminar el candidato.");
          return;
        }
        setCandidatos(candidatos.filter((c) => c.id_candidato !== idCandidato));
        showModal("success", "Eliminado", `${nombre} fue eliminado correctamente.`);
      }
    );
  };

  // 🧑‍💼 Asignar cargo (sin crear ronda automática)
  const handleAsignarCargo = async (idCandidato, idCargo) => {
    if (!idCargo) return;

    const candidatoActual = candidatos.find((c) => c.id_candidato === idCandidato);
    if (!candidatoActual) return;

    if (candidatoActual.id_cargo) {
      showModal("warning", "Ya asignado", "Este candidato ya tiene un cargo asignado.");
      return;
    }

    showModal(
      "confirm",
      "Asignar Cargo",
      `¿Deseas asignar este cargo a ${candidatoActual.nombre}?`,
      async () => {
        const { data: ocupados } = await supabase
          .from("candidato")
          .select("*")
          .eq("id_cargo", idCargo)
          .eq("id_votacion", votacionActiva.id_votacion);

        if (ocupados?.length) {
          showModal(
            "warning",
            "Cargo ocupado",
            `Este cargo ya fue asignado a ${ocupados[0].nombre}.`
          );
          return;
        }

        const { error } = await supabase
          .from("candidato")
          .update({ id_cargo: idCargo })
          .eq("id_candidato", idCandidato);

        if (error) {
          showModal("error", "Error", "Error asignando el cargo.");
          return;
        }

        showModal("success", "Cargo Asignado", "El cargo fue asignado correctamente.");
        fetchVotacionActiva();
      }
    );
  };

  // 🏁 Cerrar votación
  const handleCerrarVotacion = async () => {
    showModal(
      "confirm",
      "Cerrar Votación",
      "¿Seguro que deseas cerrar esta votación?",
      async () => {
        const { error } = await supabase
          .from("votacion")
          .update({
            estado: "Cerrada",
            fecha_cierre: new Date(),
          })
          .eq("id_votacion", votacionActiva.id_votacion);

        if (error)
          showModal("error", "Error", "Error al cerrar la votación.");
        else {
          showModal("success", "Votación Cerrada", "La votación fue cerrada correctamente.");
          setVotacionActiva(null);
          setCandidatos([]);
        }
      }
    );
  };

  // 🔁 Repetir ronda manualmente
  const handleRepetirRonda = async () => {
    showModal(
      "confirm",
      "Nueva Ronda",
      "¿Deseas iniciar una nueva ronda para continuar con otras elecciones?",
      async () => {
        const { data: rondaActual } = await supabase
          .from("ronda")
          .select("*")
          .eq("votacion_id", votacionActiva.id_votacion)
          .eq("estado", "En curso")
          .single();

        if (!rondaActual) {
          showModal("warning", "Sin Ronda Activa", "No hay ronda activa para cerrar.");
          return;
        }

        await supabase
          .from("ronda")
          .update({ estado: "Finalizada", fecha_cierre: new Date() })
          .eq("id_ronda", rondaActual.id_ronda);

        const nuevoNumero = (rondaActual.numero_de_ronda || 1) + 1;

        await supabase.from("ronda").insert([
          {
            votacion_id: votacionActiva.id_votacion,
            numero_de_ronda: nuevoNumero,
            estado: "En curso",
            fecha_inicio: new Date(),
          },
        ]);

        await supabase.from("voto").delete().eq("id_votacion", votacionActiva.id_votacion);

        showModal("success", "Ronda Creada", `Se ha creado la Ronda ${nuevoNumero}.`);
      }
    );
  };

  if (loading) return <div className="text-center mt-5">Cargando votación activa...</div>;

  return (
    <div className="container mt-4">
      <h2>🗳️ Gestión de Votación</h2>
      <hr />

      {!votacionActiva ? (
        <div className="alert alert-info">No hay ninguna votación activa actualmente.</div>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4>{votacionActiva.titulo}</h4>
            <p>{votacionActiva.descripcion}</p>
            <p>
              <strong>Estado:</strong> {votacionActiva.estado} <br />
              <strong>Votantes esperados:</strong> {votacionActiva.total_votantes} <br />
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
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select w-auto"
                      value={c.id_cargo || ""}
                      onChange={(e) => handleAsignarCargo(c.id_candidato, e.target.value)}
                      disabled={!!c.id_cargo}
                    >
                      <option value="">Sin cargo</option>
                      {cargos.map((cargo) => (
                        <option key={cargo.id_cargo} value={cargo.id_cargo}>
                          {cargo.nombre_cargo}
                        </option>
                      ))}
                    </select>

                    {c.nombre.toLowerCase() !== "voto nulo" && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          handleEliminarCandidato(c.id_candidato, c.nombre, c.id_cargo)
                        }
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="d-flex gap-3">
              <button className="btn btn-danger" onClick={handleCerrarVotacion}>
                🔒 Cerrar Votación
              </button>
              <button className="btn btn-warning" onClick={handleRepetirRonda}>
                🔁 Iniciar Nueva Ronda
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalAlert
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
