import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import CreateQuote from '@/components/CreateQuote';

export default function CotizacionPage() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <CreateQuote />
      </main>
    </div>
  );
}
