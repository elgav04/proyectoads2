import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";

const controller = {
  list: async () => {
    const conn = await connect();
    const [usuarios] = await conn.query("SELECT u.Id, u.Usuario, u.Clave, u.Rol, u.Id_Empleado, e.Nombres, e.Apellidos, u.Estado FROM usuario_sistema u LEFT JOIN empleado e ON u.Id_Empleado=e.Id ORDER BY u.Id");
    await conn.end();
    return usuarios;
  },

  edit: async (id: number) => {
    const conn = await connect();
    const [usuarios] = await conn.query("SELECT * FROM usuario_sistema WHERE Id = ?", [id]) as any[];
    await conn.end();
    return usuarios[0] || null;
  },

  save: async (data: any) => {
    const conn = await connect();

    if (!data.Id_Empleado) {
        data.Id_Empleado = null;
    }

    const [result] = await conn.query("INSERT INTO usuario_sistema SET ?", [data]);
    await conn.end();
    return { id: (result as any).insertId, ...data };
  },

  update: async (id: number, nuevoData: any) => {
    const conn = await connect();
    await conn.query("UPDATE usuario_sistema SET ? WHERE Id = ?", [nuevoData, id]);
    await conn.end();
    return { message: "Usuario actualizado" };
  },

  delete: async (id: number) => {
    const conn = await connect();
    await conn.query("UPDATE usuario_sistema SET Estado = 'Inactivo' WHERE Id = ?", [id]);
    await conn.end();
    return { message: "Usuario eliminado" };
  },
};

//endpoint 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    //si viene parametro es edit
    if (id) {
      const usuario = await controller.edit(Number(id));
      return NextResponse.json(usuario);
    }

    //si no viene parametro es general
    const usuarios = await controller.list();
    return NextResponse.json(usuarios);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // crear usuario
    const usuario = await controller.save(data);
    return NextResponse.json(usuario);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
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
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
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
    return NextResponse.json({ error: "Error eliminando usuario" }, { status: 500 });
  }
}
