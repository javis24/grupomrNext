// src/pages/reportes-unidad-negocio.js
import Sidebar from '@/components/Sidebar';
import BusinessUnitReports from '@/components/BusinessUnitReports';
import '../app/globals.css';
import BusinessUnitGraphs from '@/components/BusinessUnitGraphs';


export default function ReportesUnidadNegocio() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        {/* Sección de Reportes */}
        <section className="mb-0">
          <BusinessUnitReports />
        </section>        
        {/* Separador */}
        <hr className="my-8 border-gray-500" />

        {/* Sección de Gráficas */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Gráficas de Reportes</h2>
          <BusinessUnitGraphs />
        </section>
      </main>
    </div>
  );
}

