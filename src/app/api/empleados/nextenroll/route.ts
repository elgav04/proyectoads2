import { NextResponse } from "next/server";
import { connect } from "@/lib/db";

export async function GET() {
    const conn = await connect();
  
    const [ultimo]: any = await conn.query("SELECT MAX(EnrollNumber) AS lastEnroll FROM empleado");
  
    await conn.end();
  
    // ultimo Enroll, si no hay empezar en 1000
    const ultimoEnroll = Number(ultimo[0]?.lastEnroll) || 1000;
  
    // sumar como numero
    const siguiente = ultimoEnroll + 1;
  
    return NextResponse.json({ siguiente });
  }