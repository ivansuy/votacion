export default function ResultadosVotacion() {
  return (
    <div className="container">
      <h3 className="mb-4">Resultados en Tiempo Real</h3>

      {/* Lista de resultados simulados */}
      <ul className="list-group mb-4">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          Juan Pérez
          <span className="badge bg-primary rounded-pill">45 votos</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          María López
          <span className="badge bg-primary rounded-pill">38 votos</span>
        </li>
      </ul>

      {/* Acciones del admin */}
      <button className="btn btn-success me-2">Asignar Cargo</button>
      <button className="btn btn-warning">Limpiar Votos</button>
    </div>
  );
}
