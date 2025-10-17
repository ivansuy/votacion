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
      <div className="card shadow-lg text-center" style={{ width: "420px", borderRadius: "12px" }}>
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

  // 🔹 Cargar datos base
  const fetchBaseData = async () => {
    setLoading(true);

    const { data: votaciones } = await supabase.from("votacion").select("*").eq("estado", "Activa");

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

    const { data: listaCargos } = await supabase.from("cargo").select("id_cargo, nombre_cargo");

    setCandidatos(listaCandidatos || []);
    setCargos(listaCargos || []);
    setLoading(false);
  };

  const updateVotos = async () => {
    if (!votacionActiva) return;

    const { data: votos } = await supabase
      .from("voto")
      .select("id_candidato")
      .eq("id_votacion", votacionActiva.id_votacion);

    const conteo = {};
    votos?.forEach((v) => {
      conteo[v.id_candidato] = (conteo[v.id_candidato] || 0) + 1;
    });

    setCandidatos((prev) =>
      prev.map((c) => ({
        ...c,
        votos: conteo[c.id_candidato] || 0,
      }))
    );
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (!votacionActiva) return;
    const interval = setInterval(updateVotos, 2000);
    return () => clearInterval(interval);
  }, [votacionActiva]);

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

    setCandidatos((prev) => [...prev, data[0]]);
    setNuevoCandidato("");
    showModal("success", "Candidato agregado", "El candidato fue agregado correctamente.");
  };

  const handleEliminarCandidato = (idCandidato, nombre, idCargo) => {
    if (nombre.toLowerCase() === "voto nulo") {
      showModal("warning", "No permitido", "No puedes eliminar el candidato 'Voto Nulo'.");
      return;
    }

    if (idCargo) {
      showModal("warning", "No permitido", `${nombre} ya tiene un cargo asignado.`);
      return;
    }

    showModal("confirm", "Eliminar Candidato", `¿Deseas eliminar a ${nombre}?`, async () => {
      const { error } = await supabase.from("candidato").delete().eq("id_candidato", idCandidato);
      if (error) {
        showModal("error", "Error", "No se pudo eliminar el candidato.");
        return;
      }
      setCandidatos(candidatos.filter((c) => c.id_candidato !== idCandidato));
      showModal("success", "Eliminado", `${nombre} fue eliminado correctamente.`);
    });
  };

  const handleAsignarCargo = async (idCandidato, idCargo) => {
    if (!idCargo) return;

    const candidatoActual = candidatos.find((c) => c.id_candidato === idCandidato);
    if (!candidatoActual) return;

    if (candidatoActual.id_cargo) {
      showModal("warning", "Ya asignado", "Este candidato ya tiene un cargo.");
      return;
    }

    showModal("confirm", "Asignar Cargo", `¿Deseas asignar este cargo a ${candidatoActual.nombre}?`, async () => {
      const { data: ocupados } = await supabase
        .from("candidato")
        .select("*")
        .eq("id_cargo", idCargo)
        .eq("id_votacion", votacionActiva.id_votacion);

      if (ocupados?.length) {
        showModal("warning", "Cargo ocupado", `Ya está asignado a ${ocupados[0].nombre}.`);
        return;
      }

      const { error } = await supabase
        .from("candidato")
        .update({ id_cargo: idCargo, votos_recibidos: candidatoActual.votos || 0 })
        .eq("id_candidato", idCandidato);

      if (error) {
        showModal("error", "Error", "Error al asignar el cargo.");
        return;
      }

      showModal("success", "Cargo Asignado", "El cargo fue asignado correctamente.");
      fetchBaseData();
    });
  };

  const handleCerrarVotacion = async () => {
    showModal("confirm", "Cerrar Votación", "¿Seguro que deseas cerrar esta votación?", async () => {
      const { error } = await supabase
        .from("votacion")
        .update({ estado: "Cerrada", fecha_cierre: new Date() })
        .eq("id_votacion", votacionActiva.id_votacion);

      if (error) {
        showModal("error", "Error", "No se pudo cerrar la votación.");
        return;
      }

      showModal("success", "Votación Cerrada", "La votación fue cerrada correctamente.");
      setVotacionActiva(null);
      setCandidatos([]);
    });
  };

  const handleRepetirRonda = async () => {
    showModal(
      "confirm",
      "Nueva Ronda",
      "¿Deseas iniciar una nueva ronda de votación?",
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
    <div className="gestion-container">
      <style>{`
        .gestion-container {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .gestion-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .gestion-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .card {
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .btn-danger, .btn-warning, .btn-success {
          border: none;
          transition: all 0.3s ease;
        }

        .btn-danger:hover, .btn-warning:hover, .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }

        .list-group-item {
          border: none;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          background: #f8f9fa;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* 🔹 Encabezado */}
      <div className="gestion-header">
        <i className="fas fa-tasks fa-3x mb-3"></i>
        <h2>Gestión de Votación</h2>
        <p>Administra candidatos, cargos y rondas de la votación activa.</p>
      </div>

      {!votacionActiva ? (
        <div className="alert alert-info">No hay ninguna votación activa actualmente.</div>
      ) : (
        <div className="card p-4 mb-4">
          <h4 className="fw-bold">{votacionActiva.titulo}</h4>
          <p>{votacionActiva.descripcion}</p>

          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Nombre del candidato"
              value={nuevoCandidato}
              onChange={(e) => setNuevoCandidato(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleAgregarCandidato}>
              <i className="fas fa-user-plus me-1"></i> Agregar
            </button>
          </div>

          <h5 className="mt-4 mb-3">👥 Candidatos</h5>
          <ul className="list-group mb-4">
            {candidatos.map((c) => (
              <li key={c.id_candidato} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{c.nombre}</strong>
                  <span className="badge bg-primary ms-2">
                    🗳️ {c.votos || 0} votos
                  </span>
                </span>
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
                      <i className="fas fa-trash-alt"></i>
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
