import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import SanoQuotationForm from '@/components/SanoQuotationForm';

export default function cotizacionsano() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <SanoQuotationForm />
      </main>
    </div>
  );
}
