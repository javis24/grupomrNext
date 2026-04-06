// src/pages/manage.js
import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import MicrosipUpload from '@/components/MicrosipUpload';

export default function Clientes() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
    <Sidebar />
    <main className="flex-1 p-0">
      <MicrosipUpload />
    </main>
  </div>


    
  );
}
