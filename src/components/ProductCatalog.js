import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '', description: '', unitMeasure: 'Pieza', leadTime: '', cost: '', price: ''
    });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data);
        } catch (err) { toast.error("Error al cargar productos"); }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            unitMeasure: product.unitMeasure,
            leadTime: product.leadTime,
            cost: product.cost,
            price: product.price
        });
        setSelectedId(product.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.info("Producto eliminado");
            fetchProducts();
        } catch (err) { toast.error("Error al eliminar"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (isEditing) {
                await axios.put(`/api/products/${selectedId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Producto actualizado");
            } else {
                await axios.post('/api/products', formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Producto creado");
            }
            resetForm();
            fetchProducts();
        } catch (err) { toast.error("Error en la operación"); }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', unitMeasure: 'Pieza', leadTime: '', cost: '', price: '' });
        setIsEditing(false);
        setShowForm(false);
        setSelectedId(null);
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-500">Catálogo</h1>
                    <button 
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                        className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${showForm ? 'bg-red-600' : 'bg-blue-600'}`}
                    >
                        {showForm ? 'Cancelar' : '+ Nuevo Producto'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-[#1f2937] p-8 rounded-3xl border border-gray-700 mb-8 animate-slideUp shadow-2xl">
                        <h2 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">
                            {isEditing ? '📝 Editando Producto' : '🚀 Registrar Nuevo Producto'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Campos del formulario (iguales al anterior) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Nombre</label>
                                <input type="text" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">U.M.</label>
                                <select value={formData.unitMeasure} onChange={(e)=>setFormData({...formData, unitMeasure: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none">
                                    <option>Pieza</option><option>Kg</option><option>m3</option><option>Servicio</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Lead Time</label>
                                <input type="text" value={formData.leadTime} onChange={(e)=>setFormData({...formData, leadTime: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Costo</label>
                                <input type="number" step="0.01" value={formData.cost} onChange={(e)=>setFormData({...formData, cost: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Precio</label>
                                <input type="number" step="0.01" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-green-500" />
                            </div>
                        </div>
                        <button type="submit" className="mt-8 w-full bg-blue-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all">
                            {isEditing ? 'Actualizar Producto' : 'Guardar en Catálogo'}
                        </button>
                    </form>
                )}

                {/* Lista de Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-xl group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-black uppercase text-blue-400">{product.name}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(product)} className="p-2 bg-gray-800 rounded-lg hover:text-blue-400">✏️</button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-gray-800 rounded-lg hover:text-red-500">🗑️</button>
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs mb-4">{product.description || 'Sin descripción'}</p>
                            <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                                <span className="text-green-400 font-black">${product.price}</span>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{product.unitMeasure}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ToastContainer theme="dark" position="bottom-right" />
        </div>
    );
};

export default ProductCatalog;