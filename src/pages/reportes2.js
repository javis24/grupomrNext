// src/pages/servicios.js
import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import PerformanceMonitor from '@/components/PerformanceMonitor';

export default function ReportesPage() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />     
      <main className="flex-1 p-0">
      <PerformanceMonitor />
      </main>
    </div>


    
  );
}
