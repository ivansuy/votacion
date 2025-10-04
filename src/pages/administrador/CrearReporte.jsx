export default function Reportes() {
  return (
    <div className="container">
      <h3 className="mb-4">Reportes y Auditoría</h3>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Ganadores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Elección 2025</td>
            <td>15/03/2025</td>
            <td>
              Presidente: Juan Pérez <br />
              Secretario: María López
            </td>
            <td>
              <button className="btn btn-outline-primary btn-sm me-2">PDF</button>
              <button className="btn btn-outline-success btn-sm">Excel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
