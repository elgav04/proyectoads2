"use client";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<any[]>([]);

  //bandera indicador
  const [cargando, setCargando] = useState(false);

  //para filtros
  const [query, setQuery] = useState(""); 
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  //para paginacion
  const [pageSize] = useState<number>(15);
  const [page, setPage] = useState<number>(1);

  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");

  useEffect(() => {
    getRegistros();
  }, []);

  // reiniciar a primera pagina si hay cambio en filtros
  useEffect(() => {
    setPage(1);
  }, [query, dateFrom, dateTo]);

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getRegistros = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/registros");
      const data = await res.json();
      if (Array.isArray(data)) setRegistros(data);
      else setRegistros([]);
    } 
    catch (err) {
      console.error("Error cargando registros:", err);
      mostrarToast("Error cargando registros");
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  //traducir info de VerifyMode
  const getVerifyModeTraduccion = (codigo: number) => {
    const modos: any = {
      0: "Cualquier método",
      1: "Huella",
      2: "PIN",
      3: "Tarjeta",
      4: "Huella + PIN",
      5: "Tarjeta + PIN",
    };
    return modos[codigo] || `Modo ${codigo}`;
  };

  //traducir info de InOutMode
  const getInOutTraduccion = (codigo: number) => {
    const modos: any = {
      0: "Entrada",
      1: "Salida",
      2: "Entrada (Auto)",
      3: "Salida (Auto)",
    };
    return modos[codigo] || `Modo ${codigo}`;
  };

  const formatFecha = (fechaHora: string) => {
    if (!fechaHora) return "";

    const f = new Date(fechaHora);

    if (isNaN(f.getTime())) {
      return String(fechaHora).split(" ")[0] ?? "";
    }
    return f.toISOString().split("T")[0];
  };

  const formatHora = (fechaHora: string) => {
    if (!fechaHora) return "";

    const f = new Date(fechaHora);
    if (isNaN(f.getTime())) {
      const partes = String(fechaHora).split(" ")[1];
      return partes ? partes.slice(0, 5) : "";
    }
    return f.toTimeString().slice(0, 5);
  };

  //filtrado por enrollnumber, nombre apellido empleado, cargo, area, rango de fechas
  const registrosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();

    //rangos de fechas
    const fromDate = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const toDate = dateTo ? new Date(dateTo + "T23:59:59.999") : null;

    return registros.filter((r) => {
      // fecha
      if (fromDate || toDate) {
        const fh = r.FechaHora ? new Date(r.FechaHora) : null;
        if (!fh) return false;
        if (fromDate && fh < fromDate) return false;
        if (toDate && fh > toDate) return false;
      }

      if (!q) return true;

      const enroll = String(r.EnrollNumber ?? "").toLowerCase();
      const empleado = String(`${r.Nombres ?? ""} ${r.Apellidos ?? ""}`).toLowerCase();
      const cargo = String(r.Cargo ?? "").toLowerCase();
      const area = String(r.Area ?? r["a.Nombre"] ?? "").toLowerCase();
      const turno = String(r.Turno ?? "").toLowerCase();

      return (enroll.includes(q) || empleado.includes(q) || cargo.includes(q) || area.includes(q)) || turno.includes(q);
    });
  }, [registros, query, dateFrom, dateTo]);


  //paginacion
  const totalRegistros = registrosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / pageSize));
  const paginaActual = Math.min(Math.max(1, page), totalPaginas);
  const paginaItems = registrosFiltrados.slice((paginaActual - 1) * pageSize, paginaActual * pageSize);

  const primera = () => setPage(1);
  const anterior = () => setPage((p) => Math.max(1, p - 1));
  const siguiente = () => setPage((p) => Math.min(totalPaginas, p + 1));
  const ultima = () => setPage(totalPaginas);

  // EXPORTAR a Excel
  //MIKE AQUI VA LA FUNCION PARA EXPORTAR A EXCEL
  

  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Registro de Asistencia</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-success" disabled={registrosFiltrados.length === 0}>
            <i className="bi bi-file-earmark-excel"></i> Exportar
          </button>

          <button className="btn btn-secondary" onClick={getRegistros}>
            <i className="bi bi-arrow-clockwise"></i> Recargar
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label small mb-1">Buscar (Enroll, Empleado, Cargo, Área, Turno)</label>
              <input type="text" className="form-control form-control" placeholder="1001, Juan Medina, Contador, etc" value={query} onChange={(e) => setQuery(e.target.value)}/>
            </div>

            <div className="col-md-3">
              <label className="form-label small mb-1">Desde</label>
              <input type="date" className="form-control form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}/>
            </div>

            <div className="col-md-3">
              <label className="form-label small mb-1">Hasta</label>
              <input type="date" className="form-control form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)}/>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-warning w-100" onClick={() => {setQuery("");setDateFrom("");setDateTo("");}}>
                <i className="bi bi-eraser"></i> Limpiar filtros
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table table-bordered table-striped align-middle">
          <thead>
            <tr className="table-dark text-center small">
              <th>#</th>
              <th>EnrollNumber</th>
              <th>Empleado</th>
              <th>Cargo</th>
              <th>Área</th>
              <th>Turno</th>
              <th>Método</th>
              <th>Tipo Marcaje</th>
              <th>Fecha</th>
              <th>Hora</th>
            </tr>
          </thead>

          <tbody>
            {cargando ?
            (
              <tr>
                <td colSpan={10} className="text-center py-3">Cargando registros...</td>
              </tr>
            ) 
            : paginaItems.length === 0 ?
            (
              <tr>
                <td colSpan={10} className="text-center py-3">No hay registros</td>
              </tr>
            ) : (
              paginaItems.map((reg, indice) => (
                <tr key={reg.Id ?? indice} className="text-center">
                  <td className="nowrap">{(paginaActual - 1) * pageSize + indice + 1}</td>
                  <td className="nowrap">{reg.EnrollNumber}</td>
                  <td className="nowrap">{reg.Nombres} {reg.Apellidos}</td>
                  <td className="nowrap">{reg.Cargo}</td>
                  <td className="nowrap">{reg.Area ?? reg["a.Nombre"] ?? ""}</td>
                  <td className="nowrap">{reg.Turno}</td>
                  <td className="nowrap">{getVerifyModeTraduccion(Number(reg.VerifyMode))}</td>
                  <td className="nowrap">{getInOutTraduccion(Number(reg.InOutMode))}</td>
                  <td className="nowrap">{formatFecha(reg.FechaHora)}</td>
                  <td className="nowrap">{formatHora(reg.FechaHora)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2 small">
        <div>
          Mostrando {totalRegistros === 0 ? 0 : (paginaActual - 1) * pageSize + 1} - {Math.min(paginaActual * pageSize, totalRegistros)} de {totalRegistros}
        </div>

        <div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={primera}>« Primera</button>
              </li>
              <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={anterior}>‹ Anterior</button>
              </li>

              <li className="page-item disabled">
                <span className="page-link">Página {paginaActual} / {totalPaginas}</span>
              </li>

              <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                <button className="page-link" onClick={siguiente}>Siguiente ›</button>
              </li>
              <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                <button className="page-link" onClick={ultima}>Última »</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* toast mensaje */}
      {showToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show border-0 text-dark" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-secondary bg-opacity-25">
              <i className="bi bi-info-circle-fill text-primary me-2"></i>
              <strong className="me-auto">Notificación</strong>
              <button type="button" className="btn-close ms-2 mb-1" aria-label="Close" onClick={() => setShowToast(false)}></button>
            </div>
            <div className="toast-body fs-7 text-center">{toastMensaje}</div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
