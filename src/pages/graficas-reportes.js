import Sidebar from '@/components/Sidebar';
import BusinessUnitGraphs from '@/components/BusinessUnitGraphs';
import '../app/globals.css';


export default function GraficasReportes() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
      <BusinessUnitGraphs />
      </main>
    </div>
  );
}
