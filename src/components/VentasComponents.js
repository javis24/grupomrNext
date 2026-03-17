import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const SalesPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Servicios');

    const categories = ["Servicios", "Empaques", "Tarimas", "Alimentos", "Plasticos", "Composta"];

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        };
        fetchClients();
    }, []);

    const filteredClients = clients.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0e1624] text-white p-4 gap-6">
            
            {/* PANEL IZQUIERDO: LISTADO DE CLIENTES */}
            <div className="w-full lg:w-1/4 bg-[#1f2937] rounded-xl border border-gray-700 p-4 flex flex-col shadow-2xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                    👥 Clientes
                </h2>
                <input 
                    type="text"
                    placeholder="Buscar cliente..."
                    className="bg-[#374151] border border-gray-600 rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="overflow-y-auto flex-1 space-y-2 custom-scrollbar pr-2">
                    {filteredClients.map(client => (
                        <div 
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                selectedClient?.id === client.id 
                                ? 'bg-blue-600 border-blue-400 shadow-lg scale-105' 
                                : 'bg-[#2d3748] border-transparent hover:border-gray-500'
                            }`}
                        >
                            <p className="font-bold text-sm uppercase">{client.fullName}</p>
                            <p className="text-xs text-gray-400">{client.companyName}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* PANEL DERECHO: FORMULARIOS */}
            <div className="flex-1 space-y-6">
                {!selectedClient ? (
                    <div className="h-full flex items-center justify-center bg-[#1f2937]/50 rounded-xl border border-dashed border-gray-600">
                        <p className="text-gray-500 italic">Selecciona un cliente para comenzar el registro de venta</p>
                    </div>
                ) : (
                    <>
                        {/* HEADER DEL CLIENTE SELECCIONADO */}
                        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 flex justify-between items-center shadow-lg">
                            <div>
                                <h1 className="text-2xl font-black text-blue-400 uppercase">{selectedClient.fullName}</h1>
                                <p className="text-gray-400 text-sm">📍 {selectedClient.address}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-700">
                                    CLIENTE ACTIVO
                                </span>
                            </div>
                        </div>

                        {/* TABS DE CATEGORÍAS */}
                        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        activeTab === cat 
                                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400' 
                                        : 'bg-[#1f2937] text-gray-400 hover:bg-[#2d3748]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* FORMULARIO DINÁMICO */}
                        <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-700 shadow-2xl animate-fadeIn">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                📝 Registrar Venta: <span className="text-blue-400 underline">{activeTab}</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Campos Genéricos Visuales */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Concepto</label>
                                    <input type="text" className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Servicio de recolección" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Cantidad / Peso</label>
                                    <input type="number" className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Precio Unitario</label>
                                    <input type="number" className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500" placeholder="$0.00" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Fecha de Operación</label>
                                    <input type="date" className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Unidad / Transporte</label>
                                    <select className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Unidad 01</option>
                                        <option>Unidad 02</option>
                                        <option>Externo</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Estado de Pago</label>
                                    <select className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Pendiente</option>
                                        <option>Pagado</option>
                                        <option>Crédito</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Observaciones Adicionales</label>
                                    <textarea rows="3" className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalles específicos de la venta de {activeTab}..."></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-4">
                                <button className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 transition-all font-bold">
                                    Cancelar
                                </button>
                                <button className="px-10 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-900/40 transition-all transform active:scale-95">
                                    Guardar Registro
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <ToastContainer theme="dark" />
        </div>
    );
};

export default SalesPage;