import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import Incident from '@/components/Incident';

export default function CotizacionPage() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <Incident />
      </main>
    </div>
  );
}
