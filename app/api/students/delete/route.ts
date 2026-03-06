import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id))
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'ไม่มีรายการที่ต้องการลบ' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM students WHERE id = ANY($1::int[])',
      [ids]
    );

    return NextResponse.json({
      success: true,
      deletedCount: result.rowCount ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete API Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}