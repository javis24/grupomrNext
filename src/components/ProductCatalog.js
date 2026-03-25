import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // Estado para la categoría
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', 
        description: '', 
        unitMeasure: 'Pieza', 
        leadTime: '', 
        cost: '', 
        price: '',
        businessUnit: '' // Campo para la DB
    });

    const categories = ["Servicios", "Empaques", "Tarimas", "Alimentos", "Plasticos", "Composta"];

    useEffect(() => { 
        fetchProducts(); 
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data);
        } catch (err) { toast.error("Error al cargar productos"); }
    };

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        setFormData(prev => ({ ...prev, businessUnit: cat }));
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            unitMeasure: product.unitMeasure,
            leadTime: product.leadTime,
            cost: product.cost,
            price: product.price,
            businessUnit: product.businessUnit
        });
        setSelectedId(product.id);
        setIsEditing(true);
        setShowForm(true);
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
            const dataToSave = { ...formData, businessUnit: selectedCategory };
            if (isEditing) {
                await axios.put(`/api/products/${selectedId}`, dataToSave, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Producto actualizado");
            } else {
                await axios.post('/api/products', dataToSave, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Producto creado");
            }
            resetForm();
            fetchProducts();
        } catch (err) { toast.error("Error en la operación"); }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', unitMeasure: 'Pieza', leadTime: '', cost: '', price: '', businessUnit: selectedCategory });
        setIsEditing(false);
        setShowForm(false);
        setSelectedId(null);
    };

    // Filtrar productos por Categoría seleccionada Y por búsqueda de texto
    const filteredProducts = products.filter(p => 
        p.businessUnit === selectedCategory && 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                
                {!selectedCategory ? (
                    /* PASO 1: SELECCIÓN DE UNIDAD DE NEGOCIO */
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-blue-500">Catálogos</h1>
                        <p className="text-gray-500 mb-8 uppercase text-xs tracking-widest">Selecciona una Unidad de Negocio</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat) => (
                                <div 
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className="bg-[#1f2937] p-10 rounded-3xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] group shadow-xl flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                        <span className="text-2xl">{cat === "Servicios" ? "🛠️" : "📦"}</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{cat}</h3>
                                    <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest">Ver Inventario</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* PASO 2: GESTIÓN DE PRODUCTOS DE LA UNIDAD SELECCIONADA */
                    <div className="animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-blue-500 text-xs font-bold uppercase mb-2 hover:underline flex items-center gap-1"
                                >
                                    ⬅ Volver a Unidades
                                </button>
                                <h1 className="text-3xl font-black uppercase tracking-tighter">
                                    Catálogo: <span className="text-blue-500">{selectedCategory}</span>
                                </h1>
                            </div>
                            <button 
                                onClick={() => showForm ? resetForm() : setShowForm(true)}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${showForm ? 'bg-red-600 shadow-red-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}
                            >
                                {showForm ? 'Cancelar' : '+ Registrar Producto'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="bg-[#1f2937] p-8 rounded-3xl border border-gray-700 mb-8 animate-slideUp shadow-2xl">
                                <h2 className="text-xs font-black text-blue-400 uppercase mb-6 tracking-widest border-l-4 border-blue-400 pl-2">
                                    {isEditing ? 'Editar Producto' : 'Información del Nuevo Producto'}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Nombre</label>
                                        <input type="text" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Unidad de Medida</label>
                                        <select value={formData.unitMeasure} onChange={(e)=>setFormData({...formData, unitMeasure: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none">
                                            <option>Pieza</option><option>Kg</option><option>Metro</option><option>m3</option><option>Servicio</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Tiempo de Entrega</label>
                                        <input type="text" value={formData.leadTime} onChange={(e)=>setFormData({...formData, leadTime: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500" placeholder="Ej: 24-48 hrs" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Costo</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={(e)=>setFormData({...formData, cost: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Precio de Venta</label>
                                        <input type="number" step="0.01" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-green-500" />
                                    </div>
                                    <div className="md:col-span-3 flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Descripción</label>
                                        <textarea rows="2" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-xl p-4 text-sm outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <button type="submit" className="mt-8 w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all">
                                    {isEditing ? 'Actualizar Producto' : 'Guardar en Catálogo'}
                                </button>
                            </form>
                        )}

                        <div className="mb-8 relative">
                            <input 
                                type="text" 
                                placeholder={`Buscar en ${selectedCategory}...`} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full bg-[#1f2937] p-4 rounded-2xl border border-gray-700 outline-none pl-12 focus:ring-2 focus:ring-blue-500 transition-all" 
                            />
                            <span className="absolute left-4 top-4 opacity-30 text-xl">🔍</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-xl group hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-black uppercase text-blue-400 tracking-tight">{product.name}</h3>
                                            <span className="text-[9px] bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{product.unitMeasure}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(product)} className="p-2 bg-gray-800 rounded-xl hover:text-blue-400 transition-colors">✏️</button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-gray-800 rounded-xl hover:text-red-500 transition-colors">🗑️</button>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-6 line-clamp-2 italic">{product.description || 'Sin descripción detallada.'}</p>
                                    <div className="flex justify-between items-end border-t border-gray-800 pt-4">
                                        <div>
                                            <p className="text-[8px] text-gray-600 uppercase font-black">Precio</p>
                                            <span className="text-xl font-black text-green-400">${product.price}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-gray-600 uppercase font-black">Lead Time</p>
                                            <span className="text-[10px] font-bold text-gray-300">{product.leadTime || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20 bg-[#1f2937]/30 rounded-3xl border-2 border-dashed border-gray-800">
                                <p className="text-gray-600 uppercase font-black text-sm tracking-widest">No hay productos en esta unidad</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ToastContainer theme="dark" position="bottom-right" />
        </div>
    );
};

export default ProductCatalog;