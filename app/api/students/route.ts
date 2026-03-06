import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT
        s.id,
        s.name,
        s.grade,
        s.risk,
        COALESCE(a.status, 'unmarked') AS attendance
      FROM students s
      LEFT JOIN attendance_logs a
        ON s.id = a.student_id
        AND a.check_date = CURRENT_DATE
      ORDER BY s.id ASC
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลได้' },
      { status: 500 }
    );
  }
}