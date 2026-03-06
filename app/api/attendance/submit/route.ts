import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const records = body?.records;

    if (!records || typeof records !== 'object') {
      return NextResponse.json(
        { error: 'รูปแบบข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    for (const [studentId, status] of Object.entries(records as Record<string, string>)) {
      if (!['present', 'absent', 'late'].includes(status)) continue;

      await client.query(
        `
          INSERT INTO attendance_logs (student_id, status, check_date)
          VALUES ($1, $2, CURRENT_DATE)
          ON CONFLICT (student_id, check_date)
          DO UPDATE SET status = EXCLUDED.status
        `,
        [Number(studentId), status]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Attendance Submit Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}