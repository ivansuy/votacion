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
  const [loading, setLoading] = useState(true);

  // 🔹 Consultar resultados en tiempo real
  const fetchResultados = async () => {
    try {
      // 1️⃣ Buscar votación activa
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

      // 2️⃣ Buscar ronda activa
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

      // 3️⃣ Traer candidatos sin cargo o con nombre "Voto Nulo"
      const { data: candidatos, error: candidatosError } = await supabase
        .from("candidato")
        .select("id_candidato, nombre, id_cargo")
        .eq("id_votacion", votacion.id_votacion)
        .or("id_cargo.is.null,nombre.eq.Voto Nulo");

      if (candidatosError) {
        console.error("Error al cargar candidatos:", candidatosError.message);
        setLoading(false);
        return;
      }

      // 4️⃣ Obtener todos los votos de la ronda activa
      const { data: votos, error: votosError } = await supabase
        .from("voto")
        .select("id_candidato, es_nulo")
        .eq("id_ronda", ronda.id_ronda);

      if (votosError) {
        console.error("Error al cargar votos:", votosError.message);
        setLoading(false);
        return;
      }

      // 5️⃣ Contar votos (incluyendo nulos)
      const conteo = {};
      votos.forEach((v) => {
        if (v.es_nulo) {
          conteo["nulo"] = (conteo["nulo"] || 0) + 1;
        } else {
          conteo[v.id_candidato] = (conteo[v.id_candidato] || 0) + 1;
        }
      });

      // 6️⃣ Unir nombre con número de votos
      const resultadosFinales = candidatos
        .filter((c) => c.nombre !== null)
        .map((c) => ({
          nombre: c.nombre,
          votos:
            c.nombre === "Voto Nulo"
              ? conteo["nulo"] || 0
              : conteo[c.id_candidato] || 0,
        }));

      // 7️⃣ Ordenar: normales primero, luego el voto nulo
      const ordenados = [
        ...resultadosFinales.filter((r) => r.nombre !== "Voto Nulo"),
        ...resultadosFinales.filter((r) => r.nombre === "Voto Nulo"),
      ];

      setResultados(ordenados);
      setLoading(false);
    } catch (err) {
      console.error("Error general:", err.message);
      setLoading(false);
    }
  };

  // 🔁 Actualiza cada 2 segundos
  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">🗳️ Resultados en Tiempo Real</h2>

      {loading ? (
        <p className="text-center text-muted">Cargando resultados...</p>
      ) : votacionActiva && rondaActiva ? (
        <>
          <h4 className="text-center text-primary mb-3">
            {votacionActiva.titulo} — Ronda {rondaActiva.numero_de_ronda} (
            {rondaActiva.estado})
          </h4>

          {/* 🔹 Lista de resultados */}
          <ul className="list-group mb-4">
            {resultados.map((res, i) => (
              <li
                key={i}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  res.nombre === "Voto Nulo" ? "bg-light" : ""
                }`}
              >
                {res.nombre}
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
          <div style={{ width: "100%", height: 300 }}>
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
                <Bar
                  dataKey="votos"
                  fill="#007bff"
                  label={{ position: "top" }}
                >
                  {resultados.map((entry, index) => (
                    <cell
                      key={`cell-${index}`}
                      fill={
                        entry.nombre === "Voto Nulo" ? "#6c757d" : "#007bff"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-center text-muted mt-4">
          No hay votación activa ni ronda en curso.
        </p>
      )}
    </div>
  );
}
