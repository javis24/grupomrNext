import Sidebar from '@/components/Sidebar';
import { ExcelBarChart } from '@/components/ExcelBarChart'; 
import '../app/globals.css';


export default function ReporteMensual() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
      <ExcelBarChart />
      </main>
    </div>
  );
}
