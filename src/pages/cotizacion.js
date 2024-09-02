import Sidebar from '@/components/Sidebar';
import Cotizacion from '@/components/Cotizacion'; 
import '../app/globals.css';

export default function CotizacionPage() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <Cotizacion />
      </main>
    </div>
  );
}
