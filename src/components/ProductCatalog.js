import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { 
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, 
    FiPackage, FiX, FiChevronRight 
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M2 20h20M2 16h20M2 12h20" />
        <path d="M4 12v8M12 12v8M20 12v8" />
        <path d="M2 12v8M22 12v8" />
      </svg>
    );

    const categories = [
        { name: 'Servicios', icon: '🚛', color: 'from-blue-500 to-indigo-600' },
        { name: 'Empaques', icon: '📦', color: 'from-orange-400 to-red-500' },
        { name: 'Tarimas', icon: <div className="p-2 scale-90"><PalletIcon /></div>, color: 'from-amber-600 to-yellow-700' },
        { name: 'Alimentos', icon: '🐖', color: 'from-green-400 to-emerald-600' },
        { name: 'Plasticos', icon: '♻️', color: 'from-cyan-500 to-blue-600' },
        { name: 'Composta', icon: '🌱', color: 'from-lime-500 to-green-700' }
    ];

    useEffect(() => { 
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt.decode(token);
                setUserRole(decoded.role);
            } catch (e) { console.error("Error JWT", e); }
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
        if (userRole !== 'admin') return; 
        setFormData({ ...product });
        setSelectedId(product.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (userRole !== 'admin') return; 
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
        if (userRole !== 'admin') return toast.error("No tienes permisos");
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
         p.code?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (isLoading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0e1624] flex items-center justify-center transition-colors">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0e1624] text-gray-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
            <ToastContainer theme="colored" position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                
                {!selectedCategory ? (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter text-blue-600 dark:text-blue-500">Catálogos</h1>
                        <p className="text-blue-500 dark:text-blue-400 text-xs font-bold tracking-[0.4em] uppercase mb-10">Unidad Estratégica de Negocio</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((cat) => (
                                <div key={cat.name} onClick={() => handleCategorySelect(cat.name)}
                                    className="bg-white dark:bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:translate-y-[-8px] shadow-xl dark:shadow-2xl group relative overflow-hidden h-64 flex flex-col justify-center"
                                >
                                    <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${cat.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                    <div className="relative z-10 text-center md:text-left">
                                        <div className="w-16 h-16 mb-6 flex items-center justify-center text-6xl mx-auto md:mx-0">
                                            {cat.icon}
                                        </div>
                                        <h2 className="text-3xl font-black uppercase text-gray-800 dark:text-white mb-2">{cat.name}</h2>
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">{products.filter(p => p.businessUnit === cat.name).length} PRODUCTOS</span>
                                        </div>
                                    </div>
                                    <FiChevronRight className="absolute right-8 bottom-8 text-gray-300 dark:text-gray-700 group-hover:text-blue-500 transition-all" size={32} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-5 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedCategory(null)} className="bg-white dark:bg-[#1f2937] p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700 shadow-md">
                                    <FiArrowLeft size={24} />
                                </button>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                                    Inventario <span className="text-blue-600 dark:text-blue-500">{selectedCategory}</span>
                                </h1>
                            </div>
                            {userRole === 'admin' && (
                                <button onClick={() => showForm ? resetForm() : setShowForm(true)}
                                    className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 text-white ${showForm ? 'bg-red-600' : 'bg-blue-600'}`}
                                >
                                    {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cerrar' : 'Nuevo Producto'}
                                </button>
                            )}
                        </div>

                        {showForm && userRole === 'admin' && (
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 mb-10 shadow-2xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ModalInput label="Código / SKU" placeholder="Ej: TARET-34X37" value={formData.code} onChange={(v)=>setFormData({...formData, code: v})} required />
                                    <ModalInput label="Nombre del Producto" value={formData.name} onChange={(v)=>setFormData({...formData, name: v})} required />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Unidad de Medida</label>
                                        <select value={formData.unitMeasure} onChange={(e)=>setFormData({...formData, unitMeasure: e.target.value})} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20">
                                            <option>Pieza</option><option>Mensualidad</option><option>Kg</option><option>Metro</option><option>m3</option><option>Servicio</option>
                                        </select>
                                    </div>
                                    <ModalInput label="Lead Time" placeholder="Ej: 3-5 días" value={formData.leadTime} onChange={(v)=>setFormData({...formData, leadTime: v})} />
                                    <ModalInput label="Costo Interno" type="number" value={formData.cost} onChange={(v)=>setFormData({...formData, cost: v})} />
                                    <ModalInput label="Precio Venta" type="number" value={formData.price} onChange={(v)=>setFormData({...formData, price: v})} />
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Descripción</label>
                                        <textarea rows="3" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-500 active:scale-95 transition-all">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar SKU'}
                                </button>
                            </form>
                        )}

                        <div className="bg-white dark:bg-[#1f2937] p-5 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center shadow-lg focus-within:ring-2 ring-blue-500/30 mb-10">
                            <FiSearch className="text-gray-400 mx-4" size={24} />
                            <input type="text" placeholder={`Buscar en ${selectedCategory}...`} className="bg-transparent w-full outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-400" onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white dark:bg-[#1f2937] rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-8 hover:border-blue-500/50 transition-all shadow-lg group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-600 dark:text-blue-500 text-3xl transition-colors"><FiPackage /></div>
                                        {userRole === 'admin' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(product)} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"><FiEdit2 size={16}/></button>
                                                <button onClick={() => handleDelete(product.id)} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl hover:text-red-600 dark:hover:text-red-500 transition-all shadow-sm"><FiTrash2 size={16}/></button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black uppercase truncate text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</h3>
                                    <p className="text-blue-600 dark:text-blue-500 text-[11px] font-mono font-bold mb-4 uppercase tracking-wider">ID: {product.code || 'S/N'}</p>
                                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic line-clamp-2 h-10">{product.description || 'Sin descripción.'}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 dark:bg-[#0e1624] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <p className="text-[8px] text-gray-400 dark:text-gray-600 font-black uppercase">Precio</p>
                                                <p className="text-xl font-black text-green-600 dark:text-green-400">${product.price}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#0e1624] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                                <p className="text-[8px] text-gray-400 dark:text-gray-600 font-black uppercase">Medida</p>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1 uppercase italic">{product.unitMeasure}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ModalInput = ({ label, value, onChange, type = "text", placeholder = "", required = false }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">{label}</label>
        <input type={type} placeholder={placeholder} required={required} value={value || ''} onChange={(e)=>onChange(e.target.value)} 
               className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all" />
    </div>
);

export default ProductCatalog;