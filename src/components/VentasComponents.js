import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const SalesPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [formValues, setFormValues] = useState({
        concepto: '',
        equipo: '',
        cantidad: '',
        precioUnitario: '',
        transporte: '',
        estadoPago: '',
        fechaOperacion: '',
        observaciones: ''
    });

    const categories = ["Servicios", "Empaques", "Tarimas", "Alimentos", "Plasticos", "Composta"];
    const conceptosServicios = ["Renta de equipo", "Recolección", "Disposición final", "Destrucción"];
    const equiposServicios = ["Ruta 3 mts cúbicos", "Ruta 6 mts cúbicos", "Contenedor 30 mts cúbicos", "Contenedor 15 mts cúbicos", "Contenedor 8 mts cúbicos", "Compactador", "Jaula"];
    const opcionesTransporte = ["Entrega a domicilio sin costo", "Entrega a domicilio con costo", "Recolección por el cliente"];
    const opcionesPago = ["Anticipado", "Contado", "Crédito", "Pago parcial", "Sin costo"];

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (err) { toast.error("Error al cargar clientes"); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleReturnToUnits = () => {
        setSelectedCategory(null);
        setSelectedClient(null);
        setFormValues({ concepto: '', equipo: '', cantidad: '', precioUnitario: '', transporte: '', estadoPago: '', fechaOperacion: '', observaciones: '' });
    };

    // --- FUNCIÓN DE GUARDADO CON DEBUG ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Iniciando envío de formulario...");
        
        if (!selectedClient) {
            toast.error("Debe seleccionar un cliente");
            return;
        }

        const dataToSend = {
            ...formValues,
            unitBusiness: selectedCategory,
            clientId: selectedClient.id
        };

        console.log("Datos que se enviarán:", dataToSend);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/salesbussines', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Respuesta del servidor:", response.data);
            toast.success("¡Venta registrada con éxito!");
            handleReturnToUnits();
        } catch (err) {
            console.error("Error al enviar:", err);
            toast.error(err.response?.data?.message || "Error en la conexión con el servidor");
        }
    };

    const filteredClients = clients.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {!selectedCategory ? (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-black mb-6 uppercase tracking-tighter text-blue-500">Registrar Venta</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat) => (
                                <div key={cat} onClick={() => setSelectedCategory(cat)} className="bg-[#1f2937] p-8 rounded-3xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] shadow-xl text-center group">
                                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                                        <span className="text-2xl">{cat === "Servicios" ? "🛠️" : "📦"}</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase">{cat}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
                        {/* PANEL IZQUIERDO */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-black text-blue-500 uppercase tracking-tighter">👥 Cliente</h2>
                                    <button onClick={handleReturnToUnits} className="text-[10px] bg-gray-800 px-2 py-1 rounded-lg text-gray-400 font-bold uppercase">Cambiar Unidad</button>
                                </div>
                                <input type="text" placeholder="Buscar cliente..." className="w-full bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4" onChange={(e) => setSearchTerm(e.target.value)} />
                                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {filteredClients.map(client => (
                                        <div key={client.id} onClick={() => setSelectedClient(client)} className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedClient?.id === client.id ? 'bg-blue-600 border-blue-400' : 'bg-[#2d3748]/50 border-transparent hover:border-gray-600'}`}>
                                            <p className="font-black text-xs uppercase">{client.fullName}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 italic">{client.companyName}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FORMULARIO */}
                        <div className="flex-1">
                            {!selectedClient ? (
                                <div className="h-full min-h-[400px] flex items-center justify-center bg-[#1f2937]/30 rounded-3xl border border-dashed border-gray-700 text-gray-600 uppercase font-black text-xs">Selecciona un cliente de la izquierda</div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-[#1f2937] p-8 rounded-3xl border border-gray-700 shadow-2xl animate-slideUp">
                                    <h3 className="text-xl font-black mb-8 uppercase tracking-tighter">Detalles <span className="text-blue-500">{selectedCategory}</span></h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Concepto</label>
                                            {selectedCategory === "Servicios" ? (
                                                <select name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" required>
                                                    <option value="">Seleccionar...</option>
                                                    {conceptosServicios.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <input type="text" name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" placeholder="Producto..." required />
                                            )}
                                        </div>

                                        {selectedCategory === "Servicios" && (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Unidad / Equipo</label>
                                                <select name="equipo" value={formValues.equipo} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" required>
                                                    <option value="">Seleccionar...</option>
                                                    {equiposServicios.map(e => <option key={e} value={e}>{e}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Cantidad / Peso</label>
                                            <input type="number" name="cantidad" value={formValues.cantidad} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" placeholder="0.00" required />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Precio Unitario</label>
                                            <input type="number" name="precioUnitario" value={formValues.precioUnitario} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-green-500 text-green-400 font-bold" placeholder="$0.00" required />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Transporte</label>
                                            <select name="transporte" value={formValues.transporte} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" required>
                                                <option value="">Seleccionar...</option>
                                                {opcionesTransporte.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Estado de Pago</label>
                                            <select name="estadoPago" value={formValues.estadoPago} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" required>
                                                <option value="">Seleccionar...</option>
                                                {opcionesPago.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Fecha Operación</label>
                                            <input type="date" name="fechaOperacion" value={formValues.fechaOperacion} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 text-white" required />
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end gap-3">
                                        <button type="button" onClick={() => setSelectedClient(null)} className="px-6 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold text-[10px] uppercase">Atrás</button>
                                        <button type="submit" className="px-10 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-900/40 text-[10px] uppercase tracking-widest">Finalizar Venta</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer theme="dark" position="bottom-right" />
        </div>
    );
};

export default SalesPage;