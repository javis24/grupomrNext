// src/pages/reportes-unidad-negocio.js
import Sidebar from '@/components/Sidebar';
import BusinessUnitReports from '@/components/BusinessUnitReports';
import '../app/globals.css';


export default function ReportesUnidadNegocio() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <BusinessUnitReports />
      </main>
    </div>
  );
}
