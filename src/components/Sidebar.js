import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { 
  FiMenu, FiX, FiLogOut, FiBox, FiUsers, FiCalendar, 
  FiFileText, FiBarChart2, FiUser, FiBriefcase, FiCreditCard, 
  FiAlertCircle, FiClipboard, FiTruck, FiFile, FiTrendingUp 
} from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false); // Por defecto abierto para mejor UX

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded?.email) setUserEmail(decoded.email);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // --- LÓGICA DE PERMISOS ---
  const permissions = useMemo(() => {
    const hasTotalAccess = ['coordinadora@grupomrlaguna.com', 'facturacion@grupomrlaguna.com', 'mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'luispatino@grupomrlaguna.com', 'direccion@grupomrlaguna.com'].includes(userEmail);
    const hasPDF = ['tarimas@grupomrlaguna.com', 'logistica@grupomrlaguna.com'].includes(userEmail);
    
    return {
      total: hasTotalAccess,
      mensual: userEmail === 'direccion@grupomrlaguna.com' || hasTotalAccess,
      clientes: [...['direccion@grupomrlaguna.com', 'mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'luispatino@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com', 'tarimas@grupomrlaguna.com'], ...[hasTotalAccess ? userEmail : '']].includes(userEmail),
      cotizacion: ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'luispatino@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com'].includes(userEmail) || hasTotalAccess,
      servicios: ['direccion@grupomrlaguna.com', 'mgaliano@grupomrlaguna.com', 'logistica@grupomrlaguna.com'].includes(userEmail) || hasTotalAccess,
      asesores: ['direccion@grupomrlaguna.com', 'coordinadora@grupomrlaguna.com'].includes(userEmail) || hasTotalAccess,
      pdfMkt: hasPDF || hasTotalAccess
    };
  }, [userEmail]);

  // --- MAPEO DE ENLACES ---
  const menuItems = [
    { label: 'Asesores', href: '/user', icon: FiUser, show: permissions.asesores },
    { label: 'Calendario', href: '/calendario', icon: FiCalendar, show: permissions.total },
    { label: 'Productos', href: '/productos', icon: FiBox, show: permissions.total },    
    { label: 'Prospectos', href: '/prospectos', icon: FiClipboard, show: permissions.total },
    { label: 'Cotización', href: '/cotizacion', icon: FiFileText, show: permissions.cotizacion },
    { label: 'Clientes', href: '/clientes', icon: FiUsers, show: permissions.clientes },
    { label: 'Ventas', href: '/ventas', icon: FiTrendingUp, show: permissions.total },
    { label: 'Créditos', href: '/creditos', icon: FiCreditCard, show: permissions.total },
    { label: 'Cobranza', href: '/cartera-disponible', icon: FiCreditCard, show: permissions.total },
    { label: 'Reporte General', href: '/reportes-unidad-negocio', icon: FiBriefcase, show: permissions.total },
    { label: 'Incidencias', href: '/incidencias', icon: FiAlertCircle, show: permissions.total },  
    { label: 'PDF', href: '/archivos', icon: FiFile, show: permissions.pdfMkt },
    { label: 'MKT', href: '/mkt', icon: FiTrendingUp, show: permissions.pdfMkt },

    //quitar estos
    { label: 'Servicios', href: '/servicios', icon: FiTruck, show: permissions.servicios },
    { label: 'Rendimiento', href: '/vendedor', icon: FiBarChart2, show: permissions.total },
    { label: 'Reporte Mensual', href: '/reporte-mensual', icon: FiFileText, show: permissions.mensual },
    { label: 'Gráficas', href: '/graficas-reportes', icon: FiBarChart2, show: permissions.mensual },  
    { label: 'Reportes', href: '/reportes', icon: FiClipboard, show: permissions.cotizacion },
   
  ];

  return (
    <aside className={`sticky top-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-[#111827] text-gray-300 transition-all duration-300 flex flex-col shadow-xl`}>
      
      {/* Botón Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && <img src="/logo_mr.png" alt="Logo" className="h-8 animate-fade-in" />}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-xl text-blue-400"
        >
          {isCollapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
        <ul className="space-y-1 px-3">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg transition-all group
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-800 hover:text-white'}
                  `}
                >
                  <item.icon className={`text-xl min-w-[24px] ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-red-600/10 hover:text-red-400 text-gray-400 w-full transition-all group"
        >
          <FiLogOut className="text-xl min-w-[24px]" />
          {!isCollapsed && <span className="text-sm font-bold uppercase tracking-wider">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}