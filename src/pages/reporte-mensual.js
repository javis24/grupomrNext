// src/pages/reportes-unidad-negocio.js
import Sidebar from '@/components/Sidebar';
import MonthlyReport from '@/components/MonthlyReport.js';
import '../app/globals.css';


export default function ReporteMensual() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <MonthlyReport />
      </main>
    </div>
  );
}
