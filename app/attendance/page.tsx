'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, Clock, Save, ArrowLeft } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

type Student = {
  id: number;
  name: string;
  grade: string;
  risk: 'Low' | 'Medium' | 'High';
  attendance: AttendanceStatus;
};

type AttendanceMap = Record<number, Exclude<AttendanceStatus, 'unmarked'> | undefined>;

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students', { cache: 'no-store' });
        const data: unknown = await res.json();
        const safeStudents = Array.isArray(data) ? (data as Student[]) : [];
        setStudents(safeStudents);

        const initialAttendance: AttendanceMap = {};
        safeStudents.forEach((s) => {
          if (s.attendance !== 'unmarked') {
            initialAttendance[s.id] = s.attendance;
          }
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error('Fetch attendance error:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSelect = (id: number, status: Exclude<AttendanceStatus, 'unmarked'>) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const saveAll = async () => {
    try {
      setSaving(true);

      const res = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: attendance }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'บันทึกข้อมูลไม่สำเร็จ');
        return;
      }

      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/index" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          กลับไป Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">เช็คชื่อวันนี้ ({new Date().toLocaleDateString('th-TH')})</h1>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {loading ? (
            <div className="text-slate-400">กำลังโหลดรายชื่อนักเรียน...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3">รายชื่อนักเรียน</th>
                    <th className="py-3">ชั้นเรียน</th>
                    <th className="py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s) => (
                      <tr key={s.id} className="border-b border-slate-800/60">
                        <td className="py-4 font-medium">{s.name}</td>
                        <td className="py-4">{s.grade}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <Btn
                              active={attendance[s.id] === 'present'}
                              color="green"
                              onClick={() => handleSelect(s.id, 'present')}
                              icon={<Check className="w-4 h-4" />}
                              label="มาเรียน"
                            />
                            <Btn
                              active={attendance[s.id] === 'absent'}
                              color="red"
                              onClick={() => handleSelect(s.id, 'absent')}
                              icon={<X className="w-4 h-4" />}
                              label="ขาดเรียน"
                            />
                            <Btn
                              active={attendance[s.id] === 'late'}
                              color="yellow"
                              onClick={() => handleSelect(s.id, 'late')}
                              icon={<Clock className="w-4 h-4" />}
                              label="มาสาย"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        ยังไม่มีรายชื่อนักเรียน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <button
          onClick={saveAll}
          disabled={saving || students.length === 0}
          className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกการเช็คชื่อทั้งหมด'}
        </button>
      </div>
    </main>
  );
}

function Btn({
  active,
  color,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  color: 'green' | 'red' | 'yellow';
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const styles: Record<'green' | 'red' | 'yellow', string> = {
    green: active
      ? 'bg-green-500 text-white border-green-500'
      : 'bg-green-500/10 text-green-300 border-green-500/20',
    red: active
      ? 'bg-red-500 text-white border-red-500'
      : 'bg-red-500/10 text-red-300 border-red-500/20',
    yellow: active
      ? 'bg-yellow-500 text-white border-yellow-500'
      : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${styles[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}