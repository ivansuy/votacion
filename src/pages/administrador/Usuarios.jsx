export default function Usuarios() {
  return (
    <div className="container">
      <h3 className="mb-4">Gestión de Usuarios</h3>

      {/* Formulario de registro */}
      <form className="mb-4">
        <input type="text" className="form-control mb-2" placeholder="Nombre completo" />
        <input type="email" className="form-control mb-2" placeholder="Correo electrónico" />
        <input type="password" className="form-control mb-2" placeholder="Contraseña" />
        <button type="button" className="btn btn-primary">Crear Usuario</button>
      </form>

      {/* Tabla de usuarios */}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Admin Principal</td>
            <td>admin@iglesia.com</td>
            <td>Administrador</td>
            <td>
              <button className="btn btn-danger btn-sm">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
