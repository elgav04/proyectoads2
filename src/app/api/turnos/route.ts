import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";

const controller = {
  list: async () => {
    const conn = await connect();
    const [turnos] = await conn.query("SELECT * FROM turno ORDER BY Id");
    await conn.end();
    return turnos;
  },

  edit: async (id: number) => {
    const conn = await connect();
    const [turnos] = await conn.query("SELECT * FROM turno WHERE Id = ?", [id]) as any[];
    await conn.end();
    return turnos[0] || null;
  },

  save: async (data: any) => {
    const conn = await connect();
    const [result] = await conn.query("INSERT INTO turno SET ?", [data]);
    await conn.end();
    return { id: (result as any).insertId, ...data };
  },

  update: async (id: number, nuevoData: any) => {
    const conn = await connect();
    await conn.query("UPDATE turno SET ? WHERE Id = ?", [nuevoData, id]);
    await conn.end();
    return { message: "turno actualizado" };
  },

  delete: async (id: number) => {
    const conn = await connect();
    await conn.query("UPDATE turno SET Estado = 'Inactivo' WHERE Id = ?", [id]);
    await conn.end();
    return { message: "turno eliminado" };
  },
};

//endpoint 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    //si viene parametro es edit
    if (id) {
      const turnos = await controller.edit(Number(id));
      return NextResponse.json(turnos);
    }

    //si no viene parametro es general
    const turnos = await controller.list();
    return NextResponse.json(turnos);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo turnos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    //crear
    const turnos = await controller.save(data);
    return NextResponse.json(turnos);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error creando turno" }, { status: 500 });
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
    return NextResponse.json({ error: "Error actualizando turno" }, { status: 500 });
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
    return NextResponse.json({ error: "Error eliminando turno" }, { status: 500 });
  }
}
