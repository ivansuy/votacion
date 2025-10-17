import React, { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ResultadosVotacion() {
  const [resultados, setResultados] = useState([]);
  const [votacionActiva, setVotacionActiva] = useState(null);
  const [rondaActiva, setRondaActiva] = useState(null);
  const [totalVotos, setTotalVotos] = useState({ esperado: 0, recibido: 0 });
  const [loading, setLoading] = useState(true);

  const fetchResultados = async () => {
    try {
      const { data: votacion, error: votacionError } = await supabase
        .from("votacion")
        .select("*")
        .eq("estado", "Activa")
        .single();

      if (votacionError || !votacion) {
        setVotacionActiva(null);
        setRondaActiva(null);
        setResultados([]);
        setLoading(false);
        return;
      }

      setVotacionActiva(votacion);
      const totalEsperado = votacion.total_votantes || 0;

      const { data: ronda, error: rondaError } = await supabase
        .from("ronda")
        .select("*")
        .eq("votacion_id", votacion.id_votacion)
        .eq("estado", "En curso")
        .single();

      if (rondaError || !ronda) {
        setRondaActiva(null);
        setResultados([]);
        setLoading(false);
        return;
      }

      setRondaActiva(ronda);

      const { data: candidatos } = await supabase
        .from("candidato")
        .select("id_candidato, nombre, id_cargo")
        .eq("id_votacion", votacion.id_votacion)
        .or("id_cargo.is.null,nombre.eq.Voto Nulo");

      const { data: votos } = await supabase
        .from("voto")
        .select("id_candidato, es_nulo")
        .eq("id_ronda", ronda.id_ronda);

      const conteo = {};
      votos?.forEach((v) => {
        if (v.es_nulo) {
          conteo["nulo"] = (conteo["nulo"] || 0) + 1;
        } else {
          conteo[v.id_candidato] = (conteo[v.id_candidato] || 0) + 1;
        }
      });

      const resultadosFinales = candidatos.map((c) => ({
        nombre: c.nombre,
        votos:
          c.nombre === "Voto Nulo"
            ? conteo["nulo"] || 0
            : conteo[c.id_candidato] || 0,
      }));

      const ordenados = [
        ...resultadosFinales.filter((r) => r.nombre !== "Voto Nulo"),
        ...resultadosFinales.filter((r) => r.nombre === "Voto Nulo"),
      ];

      const totalVotosRecibidos = ordenados.reduce(
        (sum, r) => sum + r.votos,
        0
      );

      setResultados(ordenados);
      setTotalVotos({ esperado: totalEsperado, recibido: totalVotosRecibidos });
      setLoading(false);
    } catch (err) {
      console.error("Error general:", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="resultados-container">
      <style>{`
        .resultados-container {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .resultados-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .resultados-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .card {
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .list-group-item {
          border: none;
          border-radius: 10px;
          margin-bottom: 0.4rem;
          background: #f8f9fa;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .badge {
          font-size: 0.9rem;
          padding: 0.5em 0.8em;
        }

        .text-warning {
          color: #e4a11b !important;
        }

        .text-success {
          color: #28a745 !important;
        }
      `}</style>

      {/* 🔹 Encabezado */}
      <div className="resultados-header">
        <i className="fas fa-chart-bar fa-3x mb-3"></i>
        <h2>Resultados en Tiempo Real</h2>
        <p>Monitorea los votos recibidos durante la ronda actual.</p>
      </div>

      {loading ? (
        <p className="text-center text-muted">Cargando resultados...</p>
      ) : votacionActiva && rondaActiva ? (
        <div className="card p-4">
          <h4 className="text-center text-primary mb-3">
            {votacionActiva.titulo} —{" "}
            <span className="text-dark">
              Ronda {rondaActiva.numero_de_ronda} ({rondaActiva.estado})
            </span>
          </h4>

          <ul className="list-group mb-4">
            {resultados.map((res, i) => (
              <li
                key={i}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  res.nombre === "Voto Nulo" ? "bg-light" : ""
                }`}
              >
                <span className="fw-semibold">{res.nombre}</span>
                <span
                  className={`badge ${
                    res.nombre === "Voto Nulo"
                      ? "bg-secondary"
                      : "bg-primary"
                  } rounded-pill`}
                >
                  {res.votos} voto{res.votos !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>

          {/* 🔹 Gráfica de barras */}
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={resultados}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="votos" fill="#b21f1f" label={{ position: "top" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🔹 Texto de estado de votos */}
          {totalVotos.esperado > 0 && (
            <div className="text-center mt-3">
              {totalVotos.recibido < totalVotos.esperado ? (
                <p className="text-warning fw-bold">
                  🕓 Faltan {totalVotos.esperado - totalVotos.recibido} voto
                  {totalVotos.esperado - totalVotos.recibido !== 1 ? "s" : ""}{" "}
                  por recibirse.
                </p>
              ) : totalVotos.recibido > totalVotos.esperado ? (
                <p className="text-danger fw-bold">
                  ⚠️ Se recibieron {totalVotos.recibido - totalVotos.esperado} voto
                  {totalVotos.recibido - totalVotos.esperado !== 1 ? "s" : ""} de más.
                </p>
              ) : (
                <p className="text-success fw-bold">
                  ✅ Todos los votos esperados han sido recibidos.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No hay votación activa ni ronda en curso.
        </div>
      )}
    </div>
  );
}
