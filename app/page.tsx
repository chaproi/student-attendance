import Link from 'next/link'; // 1. อย่าลืม import Link เข้ามา

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-10 font-sans">
      
      {/* ส่วนแนะนำตัว (Hero Section) */}
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          ยินดีต้อนรับเข้าสู่
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-500 mb-8">
          <span className="text-blue-400">ระบบสารสนเทศสำหรับเช็คชื่อ</span>
        </h2>
      </div>

      {/* ปุ่มกดและลิงก์ */}
      <div>
        {/* 2. เปลี่ยนจาก <button> เป็น <Link> พร้อมใส่ href="/login" */}
        <Link 
          href="/login"
          className="px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-500 transition shadow-lg shadow-blue-500/50 font-semibold inline-block text-center"
        >
          เริ่มต้น
        </Link>
      </div>

    </main>
  );
}