import { useEffect, useState } from "react";
import { supabase } from "../../Config/supabaseClient";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = pdfFonts.vfs;

export default function CrearReporte() {
  const [votaciones, setVotaciones] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [votacionSeleccionada, setVotacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tituloVotacion, setTituloVotacion] = useState("");

  const fetchVotaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("votacion")
      .select("id_votacion, titulo, fecha_inicio, estado")
      .order("fecha_inicio", { ascending: false });

    if (error) console.error("Error cargando votaciones:", error.message);
    else setVotaciones(data || []);
    setLoading(false);
  };

  const fetchDetalleVotacion = async (id_votacion) => {
    try {
      setDetalles([]);
      setVotacionSeleccionada(id_votacion);

      const { data: votacion } = await supabase
        .from("votacion")
        .select("*")
        .eq("id_votacion", id_votacion)
        .single();

      setTituloVotacion(votacion.titulo);

      const { data: candidatos, error: candError } = await supabase
        .from("candidato")
        .select(`
          id_candidato,
          nombre,
          votos_recibidos,
          cargo:id_cargo (nombre_cargo)
        `)
        .eq("id_votacion", id_votacion);

      if (candError) {
        console.error("Error al cargar candidatos:", candError.message);
        return;
      }

      const resultadosFinales = candidatos.map((cand) => ({
        nombre: cand.nombre,
        cargo: cand.cargo?.nombre_cargo?.trim() || "No asignado",
        votos: cand.votos_recibidos || 0,
      }));

      const ordenJerarquico = [
        "presidente",
        "vicepresidente",
        "secretario",
        "tesorero",
        "vocal 1",
        "vocal 2",
        "vocal 3",
        "vocal 4",
        "vocal 5",
        "no asignado",
      ];

      const normalizar = (texto) =>
        texto
          ?.toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

      const obtenerIndiceCargo = (cargo) => {
        const limpio = normalizar(cargo);
        for (let i = 0; i < ordenJerarquico.length; i++) {
          const base = normalizar(ordenJerarquico[i]);
          if (limpio.includes(base)) return i;
        }
        return ordenJerarquico.length;
      };

      const resultadosOrdenados = [...resultadosFinales].sort(
        (a, b) => obtenerIndiceCargo(a.cargo) - obtenerIndiceCargo(b.cargo)
      );

      setDetalles(resultadosOrdenados);
    } catch (e) {
      console.error("Error al cargar detalle de votación:", e.message);
    }
  };

  const generarPDF = () => {
    const fechaActual = new Date().toLocaleDateString();
    const cuerpoTabla = [
      [
        { text: "Candidato", style: "tableHeader" },
        { text: "Cargo", style: "tableHeader" },
        { text: "Votos recibidos", style: "tableHeader" },
      ],
      ...detalles.map((d) => [d.nombre, d.cargo, d.votos.toString()]),
    ];

    const totalVotos = detalles.reduce((acc, d) => acc + d.votos, 0);
    cuerpoTabla.push([
      { text: "TOTAL VOTOS", colSpan: 2, alignment: "right", bold: true },
      {},
      { text: totalVotos.toString(), bold: true },
    ]);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 100, 40, 60],
      header: {
        margin: [40, 20, 40, 0],
        columns: [
          {
            text: [
              { text: "IGLESIA ASAMBLEA DE DIOS\n", style: "headerTitle" },
              { text: "SISTEMA DE VOTACIÓN DIGITAL\n\n", style: "subHeader" },
              { text: `REPORTE DE: ${tituloVotacion}\n`, style: "headerInfo" },
              { text: `FECHA: ${fechaActual}`, style: "headerInfo" },
            ],
            alignment: "center",
          },
        ],
      },
      content: [
        { text: "RESULTADOS DE LA VOTACIÓN", style: "title", margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", 80],
            body: cuerpoTabla,
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#f0f0f0" : null),
          },
        },
      ],
      styles: {
        headerTitle: { fontSize: 14, bold: true, color: "#2c3e50" },
        subHeader: { fontSize: 10, italics: true, color: "#555" },
        headerInfo: { fontSize: 9, color: "#444" },
        title: {
          fontSize: 13,
          bold: true,
          alignment: "center",
          decoration: "underline",
          color: "#1a5276",
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: "#2c3e50",
          alignment: "center",
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`Reporte_${tituloVotacion}.pdf`);
  };

  useEffect(() => {
    fetchVotaciones();
  }, []);

  if (loading) return <div className="text-center mt-5">Cargando reportes...</div>;

  return (
    <div className="crear-reporte-container">
      <style>{`
        .crear-reporte-container {
          padding: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .reporte-header {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .reporte-header h2 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .reporte-header p {
          opacity: 0.9;
        }

        .table {
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .table th {
          background: #f8f9fa;
          color: #343a40;
          font-weight: 600;
        }

        .table tbody tr:hover {
          background-color: #f1f1f1;
          transition: background 0.3s ease;
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

        .btn-outline-secondary:hover {
          transform: translateY(-1px);
        }

        h5 {
          font-weight: 600;
          margin-top: 1.5rem;
        }
      `}</style>

      {/* 🔹 Encabezado */}
      <div className="reporte-header">
        <i className="fas fa-chart-line fa-3x mb-3"></i>
        <h2>Reportes y Auditoría</h2>
        <p>Consulta, descarga y audita los resultados de cada votación realizada.</p>
      </div>

      {/* 🔹 Tabla de votaciones */}
      <table className="table table-bordered table-hover align-middle text-center">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {votaciones.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4">
                No hay votaciones registradas.
              </td>
            </tr>
          ) : (
            votaciones.map((v) => (
              <tr key={v.id_votacion}>
                <td>{v.titulo}</td>
                <td>{new Date(v.fecha_inicio).toLocaleDateString()}</td>
                <td>{v.estado}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => fetchDetalleVotacion(v.id_votacion)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🔹 Resultados detallados */}
      {votacionSeleccionada && (
        <div className="mt-5">
          <h5>🧾 Resultados de la votación</h5>
          <table className="table table-striped table-bordered mt-3 text-center">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Votos recibidos</th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3">
                    No hay candidatos electos o votos registrados.
                  </td>
                </tr>
              ) : (
                <>
                  {detalles.map((d, i) => (
                    <tr key={i}>
                      <td>{d.nombre}</td>
                      <td>{d.cargo}</td>
                      <td>{d.votos}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold table-light">
                    <td colSpan="2" className="text-end">
                      TOTAL VOTOS
                    </td>
                    <td>{detalles.reduce((acc, d) => acc + d.votos, 0)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          <div className="d-flex gap-2 justify-content-center mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setVotacionSeleccionada(null);
                setDetalles([]);
              }}
            >
              ← Regresar
            </button>
            <button className="btn btn-danger" onClick={generarPDF}>
              📄 Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
