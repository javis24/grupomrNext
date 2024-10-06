import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import { useState, useEffect } from 'react';

export default function Chat() {
  const [cliente, setCliente] = useState({ name: '', phone: '' });

  useEffect(() => {
    // Simulación de datos de cliente, aquí podrías hacer un fetch a la API para obtener datos reales
    const fetchedClient = {
      name: 'Juan Pérez',
      phone: '521234567890', // Número de teléfono sin el símbolo "+"
    };
    setCliente(fetchedClient);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      {/* Sidebar a la izquierda */}
      <Sidebar />
      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Chat con Cliente</h1>
          <p className="text-lg">Cliente: <span className="font-semibold">{cliente.name}</span></p>
          <p className="text-lg mb-4">Teléfono: <span className="font-semibold">{cliente.phone}</span></p>

          {/* Iframe para cargar WhatsApp Web */}
          <div className="mt-4 border-2 border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src={`https://web.whatsapp.com/send?phone=${cliente.phone}`}
              className="w-full h-[600px]"
              title="WhatsApp Chat"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
