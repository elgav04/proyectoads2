import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";

const controller = {
  list: async () => {
    const conn = await connect();
    const [empleados] = await conn.query("SELECT e.Id, e.EnrollNumber, e.Nombres, e.Apellidos, e.Documento, e.Direccion, e.Telefono, e.Fechaingreso, e.Id_Area, a.Nombre AS AreaEmp, e.Id_Turno, t.Nombre AS TurnoEmp, e.Cargo, e.Sueldo, e.Estado, e.EstadoBiometrico from empleado e INNER JOIN area a ON e.Id_Area = a.Id INNER JOIN turno t ON e.Id_Turno = t.Id ORDER BY e.EnrollNumber ASC;");
    await conn.end();
    return empleados;
  },

  edit: async (id: number) => {
    const conn = await connect();
    const [empleados] = await conn.query("SELECT * FROM empleado WHERE Id = ?", [id]) as any[];
    await conn.end();
    return empleados[0] || null;
  },

  save: async (data: any) => {
    const conn = await connect();
    const [result] = await conn.query("INSERT INTO empleado SET ?", [data]);
    await conn.end();
    return { id: (result as any).insertId, ...data };
  },

  update: async (id: number, nuevoData: any) => {
    const conn = await connect();
    await conn.query("UPDATE empleado SET ? WHERE Id = ?", [nuevoData, id]);
    await conn.end();
    return { message: "empleado actualizado" };
  },

  delete: async (id: number) => {
    const conn = await connect();
    await conn.query("UPDATE empleado SET Estado = 'Inactivo' WHERE Id = ?", [id]);
    await conn.end();
    return { message: "empleado eliminado" };
  },
};

//endpoint 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    //si viene parametro es edit
    if (id) {
      const empleado = await controller.edit(Number(id));
      return NextResponse.json(empleado);
    }

    //si no viene parametro es general
    const empleados = await controller.list();
    return NextResponse.json(empleados);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo empleados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    //crear
    const empleado = await controller.save(data);
    return NextResponse.json(empleado);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error creando empleado" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    //actualizar
    const data = await req.json();
    const result = await controller.update(Number(id), data);
    return NextResponse.json(result);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error actualizando empleado" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    //eliminar, eliminado logico
    const result = await controller.delete(Number(id));
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error eliminando empleado" }, { status: 500 });
  }
}
