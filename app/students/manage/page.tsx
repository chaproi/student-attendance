'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Student = {
  id: number;
  name: string;
  grade: string;
  risk: 'Low' | 'Medium' | 'High';
  attendance: 'present' | 'absent' | 'late' | 'unmarked';
};

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students', { cache: 'no-store' });
        const data: unknown = await res.json();
        setStudents(Array.isArray(data) ? (data as Student[]) : []);
      } catch (error) {
        console.error(error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const ok = confirm(`ยืนยันการลบนักเรียน ${selectedIds.length} คน?`);
    if (!ok) return;

    try {
      const res = await fetch('/api/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'ลบข้อมูลไม่สำเร็จ');
        return;
      }

      setStudents((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      alert('ลบข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Fetch Error:', error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const allChecked =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          กลับไป Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
          <h1 className="text-2xl font-bold">จัดการรายชื่อนักเรียน</h1>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อนักเรียน..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              className="rounded-xl bg-red-600 px-4 py-3 font-semibold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              ลบที่เลือก ({selectedIds.length})
            </button>
          </div>

          {loading ? (
            <div className="text-slate-400">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 w-16">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) =>
                          e.target.checked
                            ? setSelectedIds(filteredStudents.map((s) => s.id))
                            : setSelectedIds([])
                        }
                        className="w-4 h-4 accent-red-500"
                      />
                    </th>
                    <th className="py-3">รายชื่อนักเรียน</th>
                    <th className="py-3">ชั้นเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="border-b border-slate-800/60">
                        <td className="py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelect(s.id)}
                            className="w-4 h-4 accent-red-500"
                          />
                        </td>
                        <td className="py-4">{s.name}</td>
                        <td className="py-4">{s.grade}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        ไม่พบรายชื่อนักเรียนที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}