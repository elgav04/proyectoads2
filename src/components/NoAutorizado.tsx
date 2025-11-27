export default function NoAutorizado() {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "90vh" }}>
        <h1 className="text-danger">No autorizado</h1>
        <p>No tiene permisos para acceder a este módulo.</p>
      </div>
    );
  }