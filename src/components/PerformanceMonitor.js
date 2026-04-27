import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FiUser, FiCalendar, FiTarget, FiFileText, FiUsers, FiDollarSign, 
  FiCreditCard, FiAlertTriangle, FiSearch, FiDownload, FiRefreshCw, 
  FiChevronRight, FiClock, FiBriefcase, FiChevronLeft, FiPieChart, FiBarChart2
} from 'react-icons/fi';
import { format, isValid, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';

const AdvisorReports = () => {
  const [activeTab, setActiveTab] = useState('calendario');
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState('all');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // --- LÓGICA DE APOYO ---
  const getClientAntiquity = (dateValue) => {
    if (!dateValue) return '---';
    const start = new Date(dateValue);
    const now = new Date();
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) % 12;
    const days = differenceInDays(now, start) % 30;
    if (years > 0) return `${years} años, ${months} m`;
    if (months > 0) return `${months} meses`;
    return `${days} días`;
  };

  const safeFormatDate = (dateValue, formatStr = 'dd/MM/yyyy') => {
    if (!dateValue) return '---';
    const d = new Date(dateValue);
    return isValid(d) ? format(d, formatStr, { locale: es }) : '---';
  };

  // --- PROCESAMIENTO DE GRÁFICAS ---
  const chartData = useMemo(() => {
    if (activeTab !== 'clientes' && activeTab !== 'ventas') return { units: [], products: [] };
    const unitMap = {};
    const productMap = {};

    data.forEach(item => {
      const unit = item.planta || "General";
      const product = item.concepto || item.producto || "Varios";
      const amount = parseFloat(item.ventaTotal) || (parseFloat(item.cantidad) * parseFloat(item.precioUnitario)) || 0;

      if(amount > 0) {
        unitMap[unit] = (unitMap[unit] || 0) + amount;
        productMap[product] = (productMap[product] || 0) + amount;
      }
    });

    const units = Object.keys(unitMap).map(name => ({ name, total: unitMap[name] }));
    const products = Object.keys(productMap).map(name => ({ name, total: productMap[name] }))
                     .sort((a,b) => b.total - a.total).slice(0, 5);

    return { units, products };
  }, [data, activeTab]);

  // --- EFECTOS Y FETCH ---
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
        setAdvisors(res.data);
      } catch (err) { console.error("Error cargando asesores"); }
    };
    fetchAdvisors();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'calendario': endpoint = '/api/appointments'; break;
        case 'prospectos': endpoint = '/api/prospects'; break;
        case 'ventas': endpoint = '/api/salesbussines'; break;
        case 'cotizaciones': endpoint = '/api/quotes'; break;
        case 'clientes': endpoint = '/api/clients'; break;
        case 'creditos': endpoint = '/api/credits'; break;
        case 'incidencias': endpoint = '/api/incidents'; break;
        default: endpoint = '/api/appointments';
      }
      
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      let result = res.data || [];

      // Lógica especial de Clientes (Antigüedad + Cruce de Ventas)
      if (activeTab === 'clientes') {
        const resVentas = await axios.get('/api/salesbussines', { headers: { Authorization: `Bearer ${token}` } });
        const todasLasVentas = resVentas.data || [];
        
        result = result.map(cliente => {
          const totalVendido = todasLasVentas
            .filter(v => v.clientName === cliente.companyName || v.clientId === cliente.id)
            .reduce((acc, v) => acc + (parseFloat(v.cantidad) * parseFloat(v.precioUnitario)), 0);
          
          return {
            ...cliente,
            antigüedad: getClientAntiquity(cliente.createdAt),
            ventaTotal: totalVendido
          };
        });
      }
      setData(result);
    } catch (err) {
      toast.error(`Error al cargar datos de ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // --- FILTROS Y PAGINACIÓN ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const advisorId = item.userId || item.assignedTo;
      const matchesAdvisor = selectedAdvisor === 'all' || advisorId?.toString() === selectedAdvisor;
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = (
        (item.clientName || "") + (item.fullName || "") + (item.companyName || "") + 
        (item.title || "") + (item.entityName || "") + (item.concepto || "")
      ).toLowerCase().includes(searchStr);
      return matchesAdvisor && matchesSearch;
    });
  }, [data, selectedAdvisor, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // --- PDF ---
  const handleExportPDF = (isAll = true, singleItem = null) => {
    const doc = new jsPDF(isAll ? 'l' : 'p', 'mm', 'a4');
    const itemsToExport = isAll ? filteredData : [singleItem];
    const advisorName = selectedAdvisor === 'all' ? 'General' : advisors.find(a => a.id.toString() === selectedAdvisor)?.name;

    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`REPORTE DE ${activeTab.toUpperCase()}`, 15, 16);
    doc.setFontSize(8);
    doc.text(`EMISIÓN: ${format(new Date(), 'PPpp', { locale: es })} | ASESOR: ${advisorName}`, 15, 21);

    let columns = [];
    let body = [];

    switch(activeTab) {
      case 'clientes':
        columns = ['Nombre/Empresa', 'Registro', 'Antigüedad', 'Venta Total', 'Asesor'];
        body = itemsToExport.map(i => [i.companyName || i.fullName, safeFormatDate(i.createdAt), i.antigüedad || '---', `$${(i.ventaTotal || 0).toLocaleString('es-MX')}`, advisors.find(a => a.id === i.userId)?.name || 'S/N']);
        break;
      case 'ventas':
        columns = ['Fecha', 'Asesor', 'Concepto', 'Total'];
        body = itemsToExport.map(i => [safeFormatDate(i.fechaOperacion), advisors.find(a => a.id === i.userId)?.name || 'S/N', i.concepto, `$${(i.cantidad * i.precioUnitario).toLocaleString()}`]);
        break;
      default:
        columns = ['Fecha', 'Asesor', 'Entidad', 'Estatus'];
        body = itemsToExport.map(i => [safeFormatDate(i.createdAt || i.date), advisors.find(a => a.id === (i.userId || i.assignedTo))?.name || 'S/N', i.clientName || i.fullName || i.companyName, 'Activo']);
    }

    doc.autoTable({ startY: 30, head: [columns], body: body, theme: 'striped', headStyles: { fillColor: [30, 64, 175] } });
    doc.save(`${activeTab}_report_${Date.now()}.pdf`);
  };

  const reportTypes = [
    { id: 'calendario', label: 'Citas', icon: <FiCalendar /> },
    { id: 'prospectos', label: 'Prospectos', icon: <FiTarget /> },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: <FiFileText /> },
    { id: 'clientes', label: 'Clientes', icon: <FiUsers /> },
    { id: 'ventas', label: 'Ventas', icon: <FiDollarSign /> },
    { id: 'creditos', label: 'Créditos', icon: <FiCreditCard /> },
    { id: 'incidencias', label: 'Incidencias', icon: <FiAlertTriangle /> },
  ];

  return (
    /* 1. CONTENEDOR PRINCIPAL: Adaptable */
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1624] text-gray-900 dark:text-white font-sans flex flex-col lg:flex-row transition-colors duration-300">
      <ToastContainer theme="colored" />
      
      {/* SIDEBAR INTERNO */}
      <aside className="w-full lg:w-72 bg-white dark:bg-[#1f2937] border-b lg:border-r border-gray-200 dark:border-gray-800 lg:h-screen sticky top-0 z-30 flex flex-col shadow-sm">
        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-white">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-500"><FiBriefcase size={20}/></div>
          <h2 className="font-black uppercase tracking-tighter text-lg italic">Admin Hub</h2>
        </div>
        <nav className="p-4 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
          {reportTypes.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-[0.1em] flex-shrink-0 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <span className="text-lg">{item.icon}</span> <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* BARRA FILTROS */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 bg-white dark:bg-[#1f2937] p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl transition-colors">
          <div className="relative xl:col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar registros..." className="w-full bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-blue-500 transition-all text-gray-900 dark:text-white" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <select value={selectedAdvisor} onChange={(e)=>setSelectedAdvisor(e.target.value)} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 cursor-pointer">
            <option value="all">📊 Todos los Asesores</option>
            {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <div className="xl:col-span-2 flex gap-3">
            <button onClick={fetchData} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 rounded-2xl text-blue-600 dark:text-blue-500 flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all border border-gray-200 dark:border-gray-700">
              <FiRefreshCw className={isLoading ? "animate-spin" : ""}/> Sync
            </button>
            <button onClick={() => handleExportPDF(true)} className="flex-1 bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 p-4 rounded-2xl text-red-600 dark:text-red-500 flex items-center justify-center gap-3 text-[10px] font-black uppercase border border-red-200 dark:border-red-500/20 shadow-lg">
              <FiDownload size={18}/> PDF
            </button>
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICAS */}
        {(activeTab === 'clientes' || activeTab === 'ventas') && chartData.units.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-white dark:bg-[#1f2937] p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FiPieChart/> Venta por Planta</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.units} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.units.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '10px' }} 
                             itemStyle={{ color: '#000000' }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1f2937] p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl">
              <h4 className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FiBarChart2/> Top 5 Productos</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.products} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '10px' }} />
                    <Bar dataKey="total" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20}>
                        {chartData.products.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TABLA PRINCIPAL */}
        <div className="bg-white dark:bg-[#1f2937] rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-colors">
          <div className="p-8 bg-gray-50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">Listado de {activeTab}</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">{filteredData.length} Registros</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-[#0e1624]/40">
                  <th className="px-8 py-5">Fecha / Antigüedad</th>
                  <th className="px-8 py-5">Asesor</th>
                  <th className="px-8 py-5">Empresa / Concepto</th>
                  <th className="px-8 py-5 text-center">Estatus</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-32 text-center animate-pulse italic text-gray-400 uppercase font-black">Sincronizando...</td></tr>
                ) : paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{safeFormatDate(item.createdAt || item.date || item.fechaOperacion || item.incidentDate)}</p>
                      {activeTab === 'clientes' && <span className="text-[10px] text-blue-600 dark:text-blue-500 font-black flex items-center gap-1 mt-1 font-mono uppercase tracking-tighter"><FiClock/> {item.antigüedad}</span>}
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-500 font-black border border-blue-200 dark:border-blue-500/20 uppercase">
                            {(advisors.find(a => a.id === (item.userId || item.assignedTo))?.name?.substring(0,2) || "S").toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{advisors.find(a => a.id === (item.userId || item.assignedTo))?.name || 'Sistema'}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black uppercase text-gray-800 dark:text-white truncate max-w-[280px]">
                        {item.companyName || item.fullName || item.title || item.concepto || item.clientName}
                      </p>
                      {activeTab === 'clientes' && (
                        <p className="text-[10px] font-black text-green-600 dark:text-green-500 mt-1 uppercase tracking-widest">Total Ventas: ${item.ventaTotal?.toLocaleString('es-MX')}</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border ${ (item.status === 'Aprobado' || item.saleProcess === 'Cerrado') ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500 border-green-200 dark:border-green-500/30' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'}`}>
                        {item.status || item.clientStatus || item.saleProcess || 'Activo'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={()=>handleExportPDF(false, item)} className="p-3 bg-gray-50 dark:bg-[#0e1624] rounded-2xl text-gray-400 hover:text-red-600 dark:hover:text-red-500 border border-gray-200 dark:border-gray-800 transition-all hover:scale-110 shadow-sm">
                        <FiFileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length > itemsPerPage && (
            <div className="p-6 bg-gray-50 dark:bg-[#0e1624]/20 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <button disabled={currentPage === 1} onClick={() => {setCurrentPage(p => p - 1); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-20 text-gray-600 dark:text-white hover:bg-blue-600 hover:text-white transition-all"><FiChevronLeft/></button>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">Página {currentPage} de {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => {setCurrentPage(p => p + 1); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-20 text-gray-600 dark:text-white hover:bg-blue-600 hover:text-white transition-all"><FiChevronRight/></button>
            </div>
          )}
        </div>
      </main>
    </div>
  );

};

export default AdvisorReports;
