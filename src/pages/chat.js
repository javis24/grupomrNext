import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import { useState, useEffect } 
from 'react';export default function Chat() {

const [cliente, setCliente] = useState({ name: '', phone: '' });
  
    useEffect(() => {
      // Simulación de datos de cliente
      const fetchedClient = {
        name: 'Juan Pérez',
        phone: '521234567890' // Número de teléfono sin el símbolo "+"
      };
      setCliente(fetchedClient);
    }, []);
  
    return (
      <div className="flex min-h-screen bg-[#0e1624] text-white">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Chat con Cliente</h1>
            <p>Cliente: {cliente.name}</p>
            <p>Teléfono: {cliente.phone}</p>
  
            {/* Iframe para cargar WhatsApp Web */}
            <div className="mt-4">
              <iframe
                src={`https://web.whatsapp.com/send?phone=${cliente.phone}`}
                className="w-full h-[600px] rounded-lg"
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