import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';

const CreditRequestForm = () => {
    const [savedCredits, setSavedCredits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        fecha: '', nombreComercial: '', razonSocial: '', rfc: '', representanteLegal: '',
        calle: '', numero: '', colonia: '', ciudad: '', estado: '', cp: '',
        telefono1: '', telefono2: '', correo: '', giro: '', inicioActividades: '',
        contactos: {
            compras: { nombre: '', tel: '', correo: '' },
            pagos: { nombre: '', tel: '', correo: '' },
            contabilidad: { nombre: '', tel: '', correo: '' },
            operacion: { nombre: '', tel: '', correo: '' }
        },
        referenciasComerciales: [
            { empresa: '', contacto: '', domicilio: '', tel: '', monto: '', antiguedad: '' },
            { empresa: '', contacto: '', domicilio: '', tel: '', monto: '', antiguedad: '' }
        ],
        banco: { nombre: '', cuenta: '', sucursal: '', domicilio: '', tel: '', gerente: '', desde: '', saldo: '' },
        personalAutorizado: Array(5).fill({ nombre: '', ine: '' }),
        aval: { nombre: '', direccion: '', colonia: '', cp: '', tel: '', fax: '', correo: '', ine: '' },
        facturacion: { metodo: '', cfdi: '', institucion: '', cuenta: '', domicilioRevision: '', diaPagos: '' },
        solicitud: { volumen: '', monto: '', condiciones: '' },
        pagare: { no: '', buenoPor: '', lugar: '', dia: '', mes: '', anio: '', beneficiario: 'Materiales Reutilizables S.A. de C.V.', lugarPago: '', fechaPago: '', moneda: 'Pesos Mexicanos' },
        exclusivo: { fechaOtorgada: '', aprobado: false, rechazado: false, cantidad: '', recomendaciones: '', observaciones: '' }
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchCredits(); }, []);

    const fetchCredits = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/credits', { headers: { Authorization: `Bearer ${token}` } });
            setSavedCredits(res.data);
        } catch (err) { console.error("Error al cargar historial"); }
    };

    const handleChange = (path, value) => {
        const keys = path.split('.');
        setFormData(prev => {
            let newData = { ...prev };
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleAuthPersonChange = (index, field, value) => {
        const newArray = [...formData.personalAutorizado];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData({ ...formData, personalAutorizado: newArray });
    };

    const handleSave = async () => {
        if (!formData.nombreComercial || !formData.rfc) return toast.error("Nombre y RFC obligatorios");
        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                await axios.put(`/api/credits/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Solicitud actualizada");
            } else {
                await axios.post('/api/credits', formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Solicitud guardada");
            }
            setFormData(initialFormState);
            setIsEditing(false);
            fetchCredits();
        } catch (err) { toast.error("Error al procesar"); }
    };

    const loadForEdit = (credit) => {
        try {
            let dataToLoad = typeof credit.fullData === 'string' ? JSON.parse(credit.fullData) : credit.fullData;
            setFormData(dataToLoad);
            setEditingId(credit.id);
            setIsEditing(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.info("Editando: " + (dataToLoad.nombreComercial || "Solicitud"));
        } catch (e) { toast.error("Error al cargar datos"); }
    };

    const generatePDF = (rawData = formData) => {
        let data = rawData.fullData ? (typeof rawData.fullData === 'string' ? JSON.parse(rawData.fullData) : rawData.fullData) : rawData;
        
        if (!data || !data.nombreComercial) {
            toast.error("No hay información suficiente para generar el PDF");
            return;
        }

        const doc = new jsPDF();
        const yellow = [255, 204, 0];
        const gray = [240, 240, 240];
        const titleStyle = { fillColor: yellow, textColor: 0, fontStyle: 'bold', halign: 'center', fontSize: 8 };

        doc.setFontSize(8);
        doc.text("Grupo MR - Materiales Reutilizables S.A. de C.V.", 15, 15);
        doc.text(`FECHA: ${data.fecha || ''}`, 160, 15);

        doc.autoTable({
            startY: 25,
            theme: 'grid',
            headStyles: titleStyle,
            head: [[{ content: '1. DATOS FISCALES', colSpan: 4 }]],
            body: [
                ['EMPRESA', { content: data.nombreComercial, colSpan: 3 }],
                ['RFC', data.rfc, 'R. SOCIAL', data.razonSocial],
                ['REP. LEGAL', { content: data.representanteLegal, colSpan: 3 }],
                ['DOMICILIO', `${data.calle} ${data.numero}, ${data.colonia}`, 'CP', data.cp]
            ],
            styles: { fontSize: 7 }
        });

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            headStyles: titleStyle,
            head: [['DPTO.', 'NOMBRE', 'TEL', 'CORREO']],
            body: [
                ['COMPRAS', data.contactos?.compras?.nombre || '', data.contactos?.compras?.tel || '', data.contactos?.compras?.correo || ''],
                ['PAGOS', data.contactos?.pagos?.nombre || '', data.contactos?.pagos?.tel || '', data.contactos?.pagos?.correo || '']
            ],
            styles: { fontSize: 7 }
        });

        doc.save(`SOLICITUD_${data.nombreComercial}.pdf`);
        toast.success("PDF exportado");
    };

    const filteredCredits = savedCredits.filter(c => 
        c.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-2 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
                
                {/* 1. FORMULARIO */}
                <div className="bg-[#1f2937] rounded-2xl md:rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-xl md:text-2xl font-black uppercase italic">{isEditing ? '📝 Editando' : '🚀 Nueva Solicitud'}</h1>
                            <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">Todos los campos obligatorios</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            {isEditing && <button onClick={() => {setIsEditing(false); setFormData(initialFormState);}} className="flex-1 md:flex-none bg-red-500 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">Cancelar</button>}
                            <button onClick={() => generatePDF()} className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">PDF Previo</button>
                        </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-8">
                        {/* SECCIÓN 1: DATOS FISCALES (Responsive Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <InputField label="Fecha" type="date" value={formData.fecha} onChange={(v)=>handleChange('fecha', v)} />
                            <InputField label="RFC" value={formData.rfc} onChange={(v)=>handleChange('rfc', v)} />
                            <InputField label="Nombre Comercial" value={formData.nombreComercial} onChange={(v)=>handleChange('nombreComercial', v)} />
                            <InputField label="Razón Social" value={formData.razonSocial} onChange={(v)=>handleChange('razonSocial', v)} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                            <div className="space-y-6">
                                <h2 className="text-blue-400 font-black uppercase text-xs border-l-4 border-blue-500 pl-3">Ubicación y Legal</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Representante Legal" value={formData.representanteLegal} onChange={(v)=>handleChange('representanteLegal', v)} />
                                    <InputField label="Giro" value={formData.giro} onChange={(v)=>handleChange('giro', v)} />
                                    <InputField label="Calle" value={formData.calle} onChange={(v)=>handleChange('calle', v)} />
                                    <InputField label="Colonia" value={formData.colonia} onChange={(v)=>handleChange('colonia', v)} />
                                    <InputField label="Ciudad" value={formData.ciudad} onChange={(v)=>handleChange('ciudad', v)} />
                                    <InputField label="CP" value={formData.cp} onChange={(v)=>handleChange('cp', v)} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-yellow-500 font-black uppercase text-xs border-l-4 border-yellow-500 pl-3">Contactos</h2>
                                <ContactRow label="Compras" data={formData.contactos.compras} onChange={(f, v) => handleChange(`contactos.compras.${f}`, v)} />
                                <ContactRow label="Pagos" data={formData.contactos.pagos} onChange={(f, v) => handleChange(`contactos.pagos.${f}`, v)} />
                                <ContactRow label="Operación" data={formData.contactos.operacion} onChange={(f, v) => handleChange(`contactos.operacion.${f}`, v)} />
                            </div>
                        </div>

                        {/* SECCIÓN PERSONAL Y AVAL */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                            <div className="bg-[#0e1624]/30 p-4 md:p-6 rounded-2xl border border-gray-800 space-y-4">
                                <h2 className="text-purple-400 font-black uppercase text-xs">Personal Autorizado</h2>
                                {formData.personalAutorizado.map((p, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                                        <input placeholder="Nombre Completo" className="flex-1 bg-[#1f2937] border border-gray-700 p-2 rounded-lg text-xs" value={p.nombre} onChange={(e)=>handleAuthPersonChange(i, 'nombre', e.target.value)} />
                                        <input placeholder="INE" className="sm:w-32 bg-[#1f2937] border border-gray-700 p-2 rounded-lg text-xs" value={p.ine} onChange={(e)=>handleAuthPersonChange(i, 'ine', e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#0e1624]/30 p-4 md:p-6 rounded-2xl border border-gray-800 space-y-4">
                                <h2 className="text-red-400 font-black uppercase text-xs">Aval Solidario</h2>
                                <InputField label="Nombre del Aval" value={formData.aval.nombre} onChange={(v)=>handleChange('aval.nombre', v)} />
                                <InputField label="Dirección Completa" value={formData.aval.direccion} onChange={(v)=>handleChange('aval.direccion', v)} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Teléfono" value={formData.aval.tel} onChange={(v)=>handleChange('aval.tel', v)} />
                                    <InputField label="INE del Aval" value={formData.aval.ine} onChange={(v)=>handleChange('aval.ine', v)} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-500/5 p-4 md:p-6 rounded-2xl border-2 border-dashed border-yellow-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                            <InputField label="Monto Pagaré $" value={formData.pagare.buenoPor} onChange={(v)=>handleChange('pagare.buenoPor', v)} />
                            <InputField label="Lugar Expedición" value={formData.pagare.lugar} onChange={(v)=>handleChange('pagare.lugar', v)} />
                            <InputField label="Fecha de Pago" type="date" value={formData.pagare.fechaPago} onChange={(v)=>handleChange('pagare.fechaPago', v)} />
                        </div>

                        <button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95">
                            {isEditing ? 'Actualizar Registro' : 'Guardar Solicitud'}
                        </button>
                    </div>
                </div>

                {/* 2. HISTORIAL */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black uppercase text-blue-500">Historial</h2>
                            <p className="text-gray-500 text-[10px] tracking-widest font-bold">GESTIONAR SOLICITUDES PREVIAS</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input 
                                placeholder="Buscar por Nombre o RFC..." 
                                className="w-full bg-[#1f2937] border border-gray-700 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-4 top-4 opacity-30 text-xl">🔍</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredCredits.map((credit) => (
                            <div key={credit.id} className="bg-[#1f2937] p-5 md:p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-2xl">🏢</div>
                                        <span className="text-[9px] font-black bg-gray-800 px-3 py-1 rounded-full uppercase border border-gray-700">{credit.status}</span>
                                    </div>
                                    <h3 className="font-black uppercase truncate text-gray-200">{credit.nombreComercial}</h3>
                                    <p className="text-gray-500 text-[10px] font-bold mb-4">RFC: {credit.rfc}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button onClick={() => loadForEdit(credit)} className="bg-[#0e1624] hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase transition-all">✏️ Editar</button>
                                    <button onClick={() => generatePDF(credit)} className="bg-[#0e1624] hover:bg-red-600 py-3 rounded-xl text-[10px] font-black uppercase transition-all">📄 PDF</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer theme="dark" position="bottom-right" />
        </div>
    );
};

const InputField = ({ label, value, onChange, type = "text" }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">{label}</label>
        <input 
            type={type} 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            className="bg-[#0e1624] border border-gray-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all text-white w-full"
        />
    </div>
);

const ContactRow = ({ label, data, onChange }) => (
    <div className="bg-[#0e1624]/30 p-3 md:p-4 rounded-xl border border-gray-800 space-y-2">
        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{label}</div>
        <input placeholder="Nombre" value={data?.nombre || ''} onChange={(e) => onChange('nombre', e.target.value)} className="w-full bg-transparent border-b border-gray-800 p-1 text-xs outline-none focus:border-blue-500" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input placeholder="Tel." value={data?.tel || ''} onChange={(e) => onChange('tel', e.target.value)} className="bg-transparent border-b border-gray-800 p-1 text-xs outline-none focus:border-blue-500" />
            <input placeholder="Correo" value={data?.correo || ''} onChange={(e) => onChange('correo', e.target.value)} className="bg-transparent border-b border-gray-800 p-1 text-xs outline-none focus:border-blue-500" />
        </div>
    </div>
);

export default CreditRequestForm;