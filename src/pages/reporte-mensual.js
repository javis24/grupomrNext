// src/pages/reportes-unidad-negocio.js
import Sidebar from '@/components/Sidebar';
import BusinessUnitGraphs from '@/components/BusinessUnitGraphs';
import '../app/globals.css';


export default function ReporteMensual() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
      <BusinessUnitGraphs />
      </main>
    </div>
  );
}
