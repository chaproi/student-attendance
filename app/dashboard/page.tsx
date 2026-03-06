'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  ClipboardCheck,
  Settings,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';
type RiskLevel = 'Low' | 'Medium' | 'High';

type Student = {
  id: number;
  name: string;
  grade: string;
  risk: RiskLevel;
  attendance: AttendanceStatus;
};

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students', { cache: 'no-store' });
        const data: unknown = await response.json();
        setStudents(Array.isArray(data) ? (data as Student[]) : []);
      } catch (error) {
        console.error('Fetch error:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const stats = useMemo(() => {
    return {
      total: students.length,
      highRisk: students.filter((s) => s.risk === 'High').length,
      presentToday: students.filter((s) => s.attendance === 'present').length,
    };
  }, [students]);

  const riskData = [
    { name: 'ปกติ', value: students.filter((s) => s.risk === 'Low').length },
    { name: 'เฝ้าระวัง', value: students.filter((s) => s.risk === 'Medium').length },
    { name: 'เสี่ยงสูง', value: students.filter((s) => s.risk === 'High').length },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">ระบบติดตามนักเรียน</h1>
          <p className="text-slate-400 mt-2">
            ภาพรวมสถานะประจำวันที่ {new Date().toLocaleDateString('th-TH')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/attendance"
            className="rounded-2xl bg-blue-600 px-5 py-4 font-semibold hover:bg-blue-500 transition flex items-center gap-3"
          >
            <ClipboardCheck className="w-5 h-5" />
            เช็คชื่อรายวัน
          </Link>

          <Link
            href="/students/add"
            className="rounded-2xl bg-emerald-600 px-5 py-4 font-semibold hover:bg-emerald-500 transition flex items-center gap-3"
          >
            <UserPlus className="w-5 h-5" />
            เพิ่มนักเรียน
          </Link>

          <Link
            href="/students/manage"
            className="rounded-2xl bg-rose-600 px-5 py-4 font-semibold hover:bg-rose-500 transition flex items-center gap-3"
          >
            <Settings className="w-5 h-5" />
            จัดการ / ลบ
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            กำลังดึงข้อมูลล่าสุด...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="นักเรียนทั้งหมด" value={stats.total} icon={<Users className="w-5 h-5" />} />
              <StatCard title="กลุ่มเสี่ยงสูง" value={stats.highRisk} icon={<AlertTriangle className="w-5 h-5" />} />
              <StatCard title="มาเรียนวันนี้" value={stats.presentToday} icon={<CheckCircle className="w-5 h-5" />} />
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4">สัดส่วนความเสี่ยง</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4">สถานะการเช็คชื่อวันนี้</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3">ชื่อนักเรียน</th>
                      <th className="py-3">ชั้นเรียน</th>
                      <th className="py-3">สถานะวันนี้</th>
                      <th className="py-3">ความเสี่ยง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-800/60">
                          <td className="py-4">{student.name}</td>
                          <td className="py-4">{student.grade}</td>
                          <td className="py-4">
                            <StatusBadge type={student.attendance} />
                          </td>
                          <td className="py-4">
                            <RiskBadge risk={student.risk} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-slate-400 text-center">
                          ยังไม่มีรายชื่อนักเรียน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between text-slate-300">
        <span>{title}</span>
        {icon}
      </div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ type }: { type: AttendanceStatus }) {
  const styles: Record<AttendanceStatus, string> = {
    present: 'bg-green-500/10 text-green-300 border-green-500/20',
    absent: 'bg-red-500/10 text-red-300 border-red-500/20',
    late: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    unmarked: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  const labels: Record<AttendanceStatus, string> = {
    present: 'มาเรียน',
    absent: 'ขาดเรียน',
    late: 'มาสาย',
    unmarked: 'ยังไม่เช็ค',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    High: 'bg-red-500/20 text-red-300',
  };

  const label: Record<RiskLevel, string> = {
    Low: 'ปกติ',
    Medium: 'เฝ้าระวัง',
    High: 'เสี่ยงสูง',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-sm ${styles[risk]}`}>{label[risk]}</span>;
}