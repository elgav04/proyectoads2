"use client";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import ExcelJS from "exceljs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

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
    return `Modo: ${codigo}`;
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
  
    return f.toLocaleTimeString("es-HN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Tegucigalpa",
    });
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


  //exportar a Excel
  const ExportExcel = async () => {
    if (registrosFiltrados.length === 0) {
      alert("No hay registros para exportar");
      return;
    }
  
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Asistencia");
  
      ws.columns = [
        { header: "#", key: "index", width: 5 },
        { header: "EnrollNumber", key: "enroll", width: 25 },
        { header: "Empleado", key: "empleado", width: 25 },
        { header: "Cargo", key: "cargo", width: 15 },
        { header: "Área", key: "area", width: 15 },
        { header: "Turno", key: "turno", width: 12 },
        { header: "Método", key: "metodo", width: 12 },
        { header: "Tipo Marcaje", key: "tipo", width: 20 },
        { header: "Fecha", key: "fecha", width: 12 },
        { header: "Hora Marcaje", key: "hora", width: 15 },
        { header: "Hora Entrada", key: "horaEntrada", width: 15 },
        { header: "Hora Salida", key: "horaSalida", width: 15 },
        { header: "Estado", key: "estado", width: 25 },
      ];
  
      ws.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F4E78" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
  
      registrosFiltrados.forEach((r, i) => {
        let estado = "No marcó a tiempo";
        let colorEstado = "FFFA9898";
  
        //evaluar entrada
        if (r.HoraEntrada) {
          const fechaMarcaje = new Date(r.FechaHora);
          const [h, m] = r.HoraEntrada.split(":").map(Number);
          const fechaInicio = new Date(fechaMarcaje);
          fechaInicio.setHours(h, m, 0, 0);
  
          const diffMin = (fechaMarcaje.getTime() - fechaInicio.getTime()) / 60000;
          if (diffMin <= 0) {
            estado = "Marcó a tiempo";
            colorEstado = "FFC6EFCE";
          } else if (diffMin <= 15) {
            estado = "Marcaje tardío";
            colorEstado = "FFFFF2CC";
          }
        }
  
        //evaluar salida
        if (r.HoraSalida) {
          const fechaMarcaje = new Date(r.FechaHora);
          const [h, m] = r.HoraSalida.split(":").map(Number);
          const fechaSalida = new Date(fechaMarcaje);
          fechaSalida.setHours(h, m, 0, 0);
  
          if (fechaMarcaje.getTime() >= fechaSalida.getTime()) {
            estado = "Marcaje correcto";
            colorEstado = "FFC6EFCE";
          }
        }
  
        const row = ws.addRow({
          index: i + 1,
          enroll: r.EnrollNumber,
          empleado: `${r.Nombres} ${r.Apellidos}`,
          cargo: r.Cargo,
          area: r.Area ?? r["a.Nombre"] ?? "",
          turno: r.Turno,
          metodo: getVerifyModeTraduccion(Number(r.VerifyMode)),
          tipo: getInOutTraduccion(Number(r.InOutMode)),
          fecha: formatFecha(r.FechaHora),
          hora: formatHora(r.FechaHora),
          horaEntrada: r.HoraEntrada ?? "",
          horaSalida: r.HoraSalida ?? "",
          estado,
        });
  
        const estadoCell = row.getCell("estado");
        estadoCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorEstado },
        };
        estadoCell.alignment = { horizontal: "center" };
      });
  
      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `asistencia_${Date.now()}.xlsx`);
    } catch (err) {
      console.error("Error exportando Excel:", err);
      alert("Error exportando Excel");
    }
  };

  //exportar a pdf
  const ExportPDF = async () => {
    if (registrosFiltrados.length === 0) {
      alert("No hay registros para exportar");
      return;
    }
  
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([1200, 850]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 10;
      let y = 790;
  
      page.drawText("Reporte de Asistencia", { x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText(`Fecha de generación: ${new Date().toLocaleString()}`, { x: 50, y: y - 15, size: 10, font, color: rgb(0, 0, 0) });
      y -= 50;
  
      const headers = ["#", "EnrollNumber", "Empleado", "Cargo", "Área", "Turno", "Método", "Tipo Marcaje", "Fecha", "Hora Marcaje", "Hora Entrada", "Hora Salida", "Estado"];
      const colWidths = [30, 80, 150, 150, 80, 100, 60, 80, 60, 70, 70, 70, 120];
  
      let x = 50;
      headers.forEach((header, i) => {
        page.drawRectangle({ x, y: y - 2, width: colWidths[i], height: fontSize + 6, color: rgb(0.12, 0.31, 0.47) });
        page.drawText(header, { x: x + 2, y, size: fontSize, font: fontBold, color: rgb(1, 1, 1) });
        x += colWidths[i];
      });
      y -= 20;
  
      registrosFiltrados.forEach((r, index) => {
        x = 50;
        let estado = "No marcó a tiempo";
        let colorEstado = rgb(1, 0, 0);
  
        if (r.HoraEntrada) {
          const fechaMarcaje = new Date(r.FechaHora);
          const [h, m] = r.HoraEntrada.split(":").map(Number);
          const fechaInicio = new Date(fechaMarcaje);
          fechaInicio.setHours(h, m, 0, 0);
  
          const diffMin = (fechaMarcaje.getTime() - fechaInicio.getTime()) / 60000;
          if (diffMin <= 0) {
            estado = "Marcó a tiempo";
            colorEstado = rgb(0, 0.6, 0);
          } else if (diffMin <= 15) {
            estado = "Marcaje tardío";
            colorEstado = rgb(1, 0.85, 0);
          }
        }
  
        if (r.HoraSalida) {
          const fechaMarcaje = new Date(r.FechaHora);
          const [h, m] = r.HoraSalida.split(":").map(Number);
          const fechaSalida = new Date(fechaMarcaje);
          fechaSalida.setHours(h, m, 0, 0);
  
          if (fechaMarcaje.getTime() >= fechaSalida.getTime()) {
            estado = "Marcaje correcto";
            colorEstado = rgb(0, 0.6, 0);
          }
        }
  
        const values = [
          index + 1,
          r.EnrollNumber,
          `${r.Nombres} ${r.Apellidos}`,
          r.Cargo,
          r.Area ?? r["a.Nombre"] ?? "",
          r.Turno,
          getVerifyModeTraduccion(Number(r.VerifyMode)),
          getInOutTraduccion(Number(r.InOutMode)),
          formatFecha(r.FechaHora),
          formatHora(r.FechaHora),
          r.HoraEntrada ?? "",
          r.HoraSalida ?? "",
          estado,
        ];
  
        if (index % 2 === 0) {
          page.drawRectangle({ x: 50, y: y - 2, width: colWidths.reduce((a, b) => a + b, 0), height: fontSize + 6, color: rgb(0.95, 0.95, 0.95) });
        }
  
        values.forEach((val, i) => {
          const isEstado = i === values.length - 1;
          const textColor = isEstado ? colorEstado : rgb(0, 0, 0);
          page.drawText(String(val), { x, y, size: fontSize, font, color: textColor });
          x += colWidths[i];
        });
  
        y -= 20;
        if (y < 50) {
          page = pdfDoc.addPage([1200, 850]);
          y = 820;
        }
      });
  
      const pdfBytes = await pdfDoc.save();
      const uint8Array = new Uint8Array(pdfBytes);

      saveAs(new Blob([uint8Array], { type: "application/pdf" }), `asistencia_${Date.now()}.pdf`);
  
    } catch (err) {
      console.error("Error exportando PDF:", err);
      alert("Error exportando PDF");
    }
  };

  return (
    <ProtectedRoute>
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Registro de Asistencia</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-success" disabled={registrosFiltrados.length === 0} onClick={ExportExcel}>
            <i className="bi bi-file-earmark-excel"></i> Exportar
          </button>

          <button className="btn btn-danger" disabled={registrosFiltrados.length === 0} onClick={ExportPDF}>
            <i className="bi bi-file-earmark-pdf"></i> Exportar
          </button>

          <button className="btn btn-secondary" onClick={getRegistros}>
            <i className="bi bi-arrow-clockwise"></i> Recargar
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">

            {/* Input de búsqueda */}
            <div className="flex-grow-1 min-w-200 d-flex flex-column">
              <label className="form-label small mb-1">
                Buscar (Enroll, Empleado, Cargo, Área, Turno)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="1001, Juan Medina, Contador, etc"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Inputs de fecha y botón */}
            <div className="d-flex gap-2 flex-wrap">

              <div className="d-flex flex-column flex-shrink-0">
                <label className="form-label small mb-1">Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="d-flex flex-column flex-shrink-0">
                <label className="form-label small mb-1">Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="d-flex flex-column flex-shrink-0">
                <button
                  className="btn btn-warning mt-auto"
                  onClick={() => { setQuery(""); setDateFrom(""); setDateTo(""); }}
                >
                  <i className="bi bi-eraser"></i> Limpiar filtros
                </button>
              </div>

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

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-2 small">

        <div className="mb-2 mb-sm-0 text-center text-sm-start">
          Mostrando {totalRegistros === 0 ? 0 : (paginaActual - 1) * pageSize + 1} - {Math.min(paginaActual * pageSize, totalRegistros)} de {totalRegistros}
        </div>

        <div>
          <nav>
            <ul className="pagination pagination-sm mb-0 justify-content-center justify-content-sm-start">
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
