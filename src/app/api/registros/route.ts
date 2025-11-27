import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";

const controller = {
  list: async () => {
    const conn = await connect();
    const [registros] = await conn.query("SELECT r.Id, r.EnrollNumber, e.Nombres, e.Apellidos, e.Cargo, e.Id_Area, a.Nombre AS Area, e.Id_Turno, t.Nombre AS Turno, r.FechaHora, r.VerifyMode, r.InOutMode FROM registro r INNER JOIN empleado e ON r.EnrollNumber = e.EnrollNumber INNER JOIN area a ON e.Id_Area  = a.Id INNER JOIN turno t ON e.Id_Turno = t.Id ORDER BY r.Id ASC;");
    await conn.end();
    return registros;
  },
};

//endpoint 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");


    //si no viene parametro es general
    const registros = await controller.list();
    return NextResponse.json(registros);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo registros" }, { status: 500 });
  }
}

