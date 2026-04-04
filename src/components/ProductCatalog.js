import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { 
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, 
    FiPackage,FiX, FiClock, FiDollarSign, FiLayers, FiChevronRight 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [userRole, setUserRole] = useState('');
    
    const [formData, setFormData] = useState({
        code: '', name: '', description: '', unitMeasure: 'Pieza', 
        leadTime: '', cost: '', price: '', businessUnit: ''
    });

const PalletIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" // Importante: currentColor hereda el color de texto
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-full h-full"
  >
    <path d="M2 20h20M2 16h20M2 12h20" />
    <path d="M4 12v8M12 12v8M20 12v8" />
    <path d="M2 12v8M22 12v8" />
  </svg>
);

  const categories = [
    { name: 'Servicios', icon: '🚛', color: 'from-blue-500 to-indigo-600' }, // Icono de camión
    { name: 'Empaques', icon: '📦', color: 'from-orange-400 to-red-500' },
   { name: 'Tarimas', icon: <div className="p-2scale-90"><PalletIcon /></div>, color: 'from-amber-600 to-yellow-700' },
    { name: 'Alimentos', icon: '🐖', color: 'from-green-400 to-emerald-600' }, // Icono de cerdo
    { name: 'Plasticos', icon: '♻️', color: 'from-cyan-500 to-blue-600' },
    { name: 'Composta', icon: '🌱', color: 'from-lime-500 to-green-700' }
];

    useEffect(() => { 
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt.decode(token);
            setUserRole(decoded.role);
        }
        fetchProducts(); 
    }, []);

   const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data);
        } catch (err) { toast.error("Error al cargar productos"); }
        setIsLoading(false);
    };

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        setFormData(prev => ({ ...prev, businessUnit: cat }));
    };

    const handleEdit = (product) => {
        if (userRole !== 'admin') return; // Bloqueo extra en UI
        setFormData({ ...product });
        setSelectedId(product.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (userRole !== 'admin') return; // Bloqueo extra en UI
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
        setFormData({ code: '', name: '', description: '', unitMeasure: 'Pieza', leadTime: '', cost: '', price: '', businessUnit: selectedCategory });
        setIsEditing(false);
        setShowForm(false);
        setSelectedId(null);
    };

   const filteredProducts = products.filter(p => 
    p.businessUnit === selectedCategory && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.code?.toLowerCase().includes(searchTerm.toLowerCase())) // <-- Búsqueda dual
);

    if (isLoading) return (
        <div className="min-h-screen bg-[#0e1624] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                
                {!selectedCategory ? (
                    /* PASO 1: SELECCIÓN DE UNIDAD (Cards de 2.5rem con gradientes) */
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter text-blue-500">Catálogos</h1>
                        <p className="text-blue-400 text-xs font-bold tracking-[0.4em] uppercase mb-10">Selección de Unidad Estratégica</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((cat) => {
                                const count = products.filter(p => p.businessUnit === cat.name).length;
                                return (
                                    <div 
                                key={cat.name}
                                onClick={() => handleCategorySelect(cat.name)}
                                className="bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:translate-y-[-8px] shadow-2xl group relative overflow-hidden"
                            >
                                {/* Fondo gradiente decorativo */}
                                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${cat.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                
                                <div className="relative z-10">
                                    {/* CONTENEDOR ÚNICO DEL ICONO: Controla el tamaño (w-16 h-16) y centra el contenido */}
                                    <div className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center text-6xl">
                                        {typeof cat.icon === 'string' 
                                            ? cat.icon 
                                            : <div className="text-blue-500 w-full h-full flex items-center justify-center p-2 scale-90">{cat.icon}</div>
                                        }
                                    </div>

                                    <h2 className="text-3xl font-black uppercase text-white mb-2">{cat.name}</h2>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                                        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">{count} Productos</span>
                                    </div>
                                </div>

                                <FiChevronRight className="absolute right-8 bottom-8 text-gray-700 group-hover:text-blue-500 transition-all" size={32} />
</div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* PASO 2: GESTIÓN DE PRODUCTOS */
                    <div className="animate-in slide-in-from-bottom-5 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <div className="flex items-center gap-5">
                                <button 
                                    onClick={() => setSelectedCategory(null)} 
                                    className="bg-[#1f2937] p-4 rounded-2xl hover:bg-blue-600 transition-all border border-gray-700 shadow-lg"
                                >
                                    <FiArrowLeft size={24} />
                                </button>
                                <div>
                                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                        Inventario <span className="text-blue-500">{selectedCategory}</span>
                                    </h1>
                                    <p className="text-blue-500 text-xs font-bold tracking-[0.3em] uppercase mt-1">Gestión de Catálogo Maestro</p>
                                </div>
                            </div>
                            {userRole === 'admin' && (
                            <button 
                                onClick={() => showForm ? resetForm() : setShowForm(true)}
                                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${showForm ? 'bg-red-600' : 'bg-blue-600'}`}
                            >
                                {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cerrar' : 'Nuevo Producto'}
                            </button>
                        )}
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 mb-10 shadow-2xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Código / SKU</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: TARET-34X37"
                                            required 
                                            value={formData.code} 
                                            onChange={(e)=>setFormData({...formData, code: e.target.value})} 
                                            className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all text-blue-400 font-mono" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Nombre del Producto</label>
                                        <input type="text" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Unidad de Medida</label>
                                        <select value={formData.unitMeasure} onChange={(e)=>setFormData({...formData, unitMeasure: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none">
                                            <option>Mensualidad</option><option>Pieza</option><option>Kg</option><option>Metro</option><option>m3</option><option>Servicio</option>
                                        </select>
                                    </div>
                                   
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Tiempo de Entrega (Lead Time)</label>
                                        <input type="text" value={formData.leadTime} onChange={(e)=>setFormData({...formData, leadTime: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Costo Interno</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={(e)=>setFormData({...formData, cost: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-red-500 transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Precio de Venta</label>
                                        <input type="number" step="0.01" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-green-500 transition-all" />
                                    </div>
                                    <div className="md:col-span-3 flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Descripción Técnica</label>
                                        <textarea rows="3" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all resize-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all active:scale-95">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar SKU'}
                                </button>
                            </form>
                        )}

                        <div className="bg-[#1f2937] p-5 rounded-3xl border border-gray-700 flex items-center shadow-2xl focus-within:ring-2 ring-blue-500/50 transition-all mb-10">
                            <FiSearch className="text-gray-500 mx-4" size={24} />
                            <input 
                                type="text" 
                                placeholder={`Buscar producto en ${selectedCategory}...`} 
                                className="bg-transparent w-full outline-none text-lg text-white font-medium" 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 p-8 hover:border-blue-500/50 transition-all shadow-xl flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 text-3xl">
                                                <FiPackage />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(product)} className="bg-gray-800 p-3 rounded-xl hover:text-blue-400 transition-all"><FiEdit2 size={16}/></button>
                                                {userRole === 'admin' && (
                                                    <button onClick={() => handleDelete(product.id)} className="bg-gray-800 p-3 rounded-xl hover:text-red-500 transition-all"><FiTrash2 size={16}/></button>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase truncate text-white mb-1 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                                        <p className="text-blue-500 text-[11px] font-mono font-bold mb-2 uppercase tracking-wider">
                                            ID: {product.code || 'SIN CÓDIGO'}
                                        </p>
                                        <p className="text-gray-500 text-[10px] font-bold mb-6 uppercase tracking-[0.2em]">Medida: {product.unitMeasure}</p>
                                        
                                        <div className="space-y-4 border-t border-gray-800 pt-6">
                                            <div className="flex items-center gap-3 text-sm text-gray-400 italic leading-snug min-h-[40px]">
                                                {product.description || 'Sin descripción detallada.'}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#0e1624] p-3 rounded-2xl border border-gray-800">
                                                    <p className="text-[8px] text-gray-600 font-black uppercase">Precio Venta</p>
                                                    <p className="text-xl font-black text-green-400">${product.price}</p>
                                                </div>
                                                <div className="bg-[#0e1624] p-3 rounded-2xl border border-gray-800 text-center">
                                                    <p className="text-[8px] text-gray-600 font-black uppercase">Lead Time</p>
                                                    <p className="text-xs font-bold text-gray-300 mt-1 uppercase italic">{product.leadTime || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-32 bg-[#1f2937]/50 rounded-[3rem] border-2 border-dashed border-gray-800">
                                <p className="text-gray-600 font-black uppercase tracking-widest text-xl italic">No hay productos en esta unidad</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCatalog;