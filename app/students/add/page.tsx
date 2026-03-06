'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

type FormDataState = {
  name: string;
  grade: string;
  risk: 'Low' | 'Medium' | 'High';
};

export default function AddStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    grade: '',
    risk: 'Low',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch('/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'เพิ่มข้อมูลไม่สำเร็จ');
        return;
      }

      alert('เพิ่มรายชื่อนักเรียนสำเร็จ');
      router.push('/index');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/index" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          กลับไป Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold mb-6">เพิ่มนักเรียนใหม่</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-slate-300">ชื่อ-นามสกุล</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">ชั้นเรียน</label>
              <input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">ระดับความเสี่ยง</label>
              <select
                value={formData.risk}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    risk: e.target.value as FormDataState['risk'],
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Low">ปกติ (Low)</option>
                <option value="Medium">เฝ้าระวัง (Medium)</option>
                <option value="High">เสี่ยงสูง (High)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}