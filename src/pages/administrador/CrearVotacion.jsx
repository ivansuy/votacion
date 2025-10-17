import { useState, useEffect } from "react";
import { supabase } from "../../Config/supabaseClient";

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
      <div className="card shadow-lg text-center" style={{ width: "420px", borderRadius: "12px" }}>
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

export default function CrearVotacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [totalVotantes, setTotalVotantes] = useState("");
  const [candidatos, setCandidatos] = useState([]);
  const [nuevoCandidato, setNuevoCandidato] = useState("");
  const [votacionActiva, setVotacionActiva] = useState(null);

  const [modal, setModal] = useState({ show: false, type: "info", title: "", message: "" });

  const showModal = (type, title, message) => setModal({ show: true, type, title, message });
  const closeModal = () => setModal({ ...modal, show: false });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("votacion")
        .select("*")
        .eq("estado", "Activa")
        .order("fecha_inicio", { ascending: false })
        .limit(1);

      if (error) {
        showModal("error", "Error", "No se pudo verificar la votación activa.");
      } else if (data?.length > 0) {
        setVotacionActiva(data[0]);
      }
    };
    fetchData();
  }, []);

  const handleAgregarCandidato = () => {
    if (nuevoCandidato.trim() === "") {
      showModal("warning", "Campo vacío", "Debes ingresar un nombre para el candidato.");
      return;
    }
    if (candidatos.some((c) => c.nombre.toLowerCase() === nuevoCandidato.toLowerCase())) {
      showModal("warning", "Duplicado", "Este candidato ya fue agregado.");
      return;
    }
    setCandidatos([...candidatos, { nombre: nuevoCandidato }]);
    showModal("success", "Candidato Agregado", `${nuevoCandidato} fue agregado correctamente.`);
    setNuevoCandidato("");
  };

  const handleEliminarCandidato = (index) => {
    const nombreEliminado = candidatos[index].nombre;
    setCandidatos(candidatos.filter((_, i) => i !== index));
    showModal("info", "Candidato Eliminado", `${nombreEliminado} fue eliminado de la lista.`);
  };

  const handleCrearVotacion = async () => {
    try {
      if (votacionActiva) {
        showModal("warning", "Votación activa", `Ya existe una votación activa: ${votacionActiva.titulo}`);
        return;
      }

      if (!titulo || !totalVotantes) {
        showModal("warning", "Campos incompletos", "Completa el título y el número de votantes esperados.");
        return;
      }

      if (candidatos.length < 3) {
        showModal("warning", "Faltan candidatos", "Debes agregar al menos 3 candidatos.");
        return;
      }

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
        showModal("error", "Error", "No se pudo crear la votación.");
        return;
      }

      const votacionId = votacionData.id_votacion;

      const lista = candidatos.map((c) => ({ nombre: c.nombre, id_votacion: votacionId }));
      await supabase.from("candidato").insert(lista);
      await supabase.from("candidato").insert([{ nombre: "Voto Nulo", id_votacion: votacionId }]);
      await supabase.from("ronda").insert([
        {
          votacion_id: votacionId,
          cargo_id: null,
          numero_de_ronda: 1,
          estado: "En curso",
          fecha_inicio: new Date(),
        },
      ]);

      showModal("success", "Votación Creada", "La votación fue creada exitosamente.");
      setTitulo("");
      setDescripcion("");
      setTotalVotantes("");
      setCandidatos([]);
    } catch (e) {
      showModal("error", "Error inesperado", "Ocurrió un error al crear la votación.");
    }
  };

  return (
    <div className="crear-votacion-container">
      <style>{`
        .crear-votacion-container {
          padding: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .votacion-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .votacion-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(178,31,31,0.3);
        }

        .btn-success {
          background: #198754;
          border: none;
          transition: all 0.3s ease;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }

        .form-control {
          border-radius: 10px;
          border: 1px solid #dee2e6;
          transition: border-color 0.3s;
        }

        .form-control:focus {
          border-color: #b21f1f;
          box-shadow: 0 0 0 0.2rem rgba(178,31,31,0.25);
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
      <div className="votacion-header">
        <i className="fas fa-vote-yea fa-3x mb-3"></i>
        <h2>Crear Votación</h2>
        <p>Configura una nueva votación, agrega los candidatos y define la cantidad de votantes esperados.</p>
      </div>

      {votacionActiva ? (
        <div className="alert alert-warning mt-3">
          ⚠️ Ya existe una votación activa: <strong>{votacionActiva.titulo}</strong>.  
          Cierra esa votación desde <b>Gestión de Votación</b> antes de crear una nueva.
        </div>
      ) : (
        <div className="card p-4">
          <h5 className="mb-3">🗳️ Información de la votación</h5>

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

          <button onClick={handleCrearVotacion} className="btn btn-primary w-100 mb-4">
            Crear Votación
          </button>

          <h5 className="mb-3">👥 Candidatos</h5>
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

          {candidatos.length > 0 && (
            <ul className="list-group">
              {candidatos.map((c, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{c.nombre}</span>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminarCandidato(i)}>
                    <i className="fas fa-trash-alt me-1"></i> Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 🔹 Modal */}
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
