// src/pages/CarteraDisponible.js
import Sidebar from '@/components/Sidebar';
import ClientPrice from '@/components/ClientPrices';
import '../app/globals.css';



export default function CarteraDisponible() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
          <Sidebar />
      <main className="flex-1 p-0">
        <ClientPrice />
      </main>
    </div>
  );
}
