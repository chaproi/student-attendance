import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const grade = String(body?.grade ?? '').trim();
    const risk = String(body?.risk ?? '').trim();

    if (!name || !grade || !risk) {
      return NextResponse.json(
        { error: 'กรอกข้อมูลไม่ครบ' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO students (name, grade, risk) VALUES ($1, $2, $3) RETURNING *',
      [name, grade, risk]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}