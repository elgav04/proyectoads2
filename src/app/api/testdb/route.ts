import { NextResponse } from "next/server";
import { connect } from "@/lib/db";

export async function GET() {
  try {
    const conn = await connect();
    await conn.end();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("TEST DB error en db:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}