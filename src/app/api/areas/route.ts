import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";

const controller = {
  list: async () => {
    const conn = await connect();
    const [areas] = await conn.query("SELECT * FROM area ORDER BY Id");
    await conn.end();
    return areas;
  },

  edit: async (id: number) => {
    const conn = await connect();
    const [areas] = await conn.query("SELECT * FROM area WHERE Id = ?", [id]) as any[];
    await conn.end();
    return areas[0] || null;
  },

  save: async (data: any) => {
    const conn = await connect();
    const [result] = await conn.query("INSERT INTO area SET ?", [data]);
    await conn.end();
    return { id: (result as any).insertId, ...data };
  },

  update: async (id: number, nuevoData: any) => {
    const conn = await connect();
    await conn.query("UPDATE area SET ? WHERE Id = ?", [nuevoData, id]);
    await conn.end();
    return { message: "area actualizada" };
  },

  delete: async (id: number) => {
    const conn = await connect();
    await conn.query("UPDATE area SET Estado = 'Inactivo' WHERE Id = ?", [id]);
    await conn.end();
    return { message: "area eliminada" };
  },
};

//endpoint 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    //si viene parametro es edit
    if (id) {
      const area = await controller.edit(Number(id));
      return NextResponse.json(area);
    }

    //si no viene parametro es general
    const areas = await controller.list();
    return NextResponse.json(areas);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo areas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    //crear
    const area = await controller.save(data);
    return NextResponse.json(area);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error creando area" }, { status: 500 });
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
    return NextResponse.json({ error: "Error actualizando area" }, { status: 500 });
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
    return NextResponse.json({ error: "Error eliminando area" }, { status: 500 });
  }
}
