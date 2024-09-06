// src/pages/servicios.js
import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import Servicios from '@/components/Servicios';

export default function ServiciosPage() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />     
      <main className="flex-1 p-8">
      <Servicios />
      </main>
    </div>


    
  );
}
