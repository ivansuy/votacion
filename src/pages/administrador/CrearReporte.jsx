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

  // 🔹 Cargar votaciones
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

  // 🔹 Cargar detalle (ganadores + votos)
  const fetchDetalleVotacion = async (id_votacion) => {
    const vot = votaciones.find((v) => v.id_votacion === id_votacion);
    setTituloVotacion(vot?.titulo || "");
    setVotacionSeleccionada(id_votacion);

    const { data: candidatos } = await supabase
      .from("candidato")
      .select("id_candidato, nombre, id_cargo, cargo: id_cargo (nombre_cargo)")
      .eq("id_votacion", id_votacion)
      .not("id_cargo", "is", null);

    const { data: votos } = await supabase
      .from("voto")
      .select("id_candidato", { count: "exact" })
      .eq("id_votacion", id_votacion)
      .not("id_candidato", "is", null);

    const conteo = {};
    votos?.forEach((v) => {
      conteo[v.id_candidato] = (conteo[v.id_candidato] || 0) + 1;
    });

    const resultados = candidatos?.map((c) => ({
      nombre: c.nombre,
      cargo: c.cargo?.nombre_cargo || "Sin cargo",
      votos: conteo[c.id_candidato] || 0,
    }));

    setDetalles(resultados || []);
  };

  // 🔹 Generar PDF
  const generarPDF = () => {
    const fechaActual = new Date().toLocaleDateString();
    const cuerpoTabla = [
      [
        { text: "Candidato", style: "tableHeader" },
        { text: "Cargo", style: "tableHeader" },
        { text: "Votos", style: "tableHeader" },
      ],
      ...detalles.map((d) => [d.nombre, d.cargo, d.votos.toString()]),
    ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 100, 40, 60], // margen superior para encabezado
      header: {
        margin: [40, 20, 40, 0],
        columns: [
          // {
          //   image: "", // puedes agregar base64 de logo si deseas
          //   width: 50,
          //   height: 50,
          //   margin: [0, 10, 10, 0],
          // },
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
        headerTitle: {
          fontSize: 14,
          bold: true,
          color: "#2c3e50",
        },
        subHeader: {
          fontSize: 10,
          italics: true,
          color: "#555",
        },
        headerInfo: {
          fontSize: 9,
          color: "#444",
        },
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
    <div className="container mt-4">
      <h3>📊 Reportes y Auditoría</h3>
      <hr />

      {/* Tabla de votaciones */}
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-light">
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
              <td colSpan="4" className="text-center">
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

      {/* Detalles */}
      {votacionSeleccionada && (
        <div className="mt-5">
          <h5>🧾 Resultados de la votación</h5>
          <table className="table table-striped table-bordered mt-3">
            <thead className="table-light">
              <tr>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Votos recibidos</th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No hay candidatos electos o votos registrados.
                  </td>
                </tr>
              ) : (
                detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.nombre}</td>
                    <td>{d.cargo}</td>
                    <td>{d.votos}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setVotacionSeleccionada(null)}
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
