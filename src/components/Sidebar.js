import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { 
  FiMenu, FiX, FiLogOut, FiBox, FiUsers, FiCalendar, 
  FiFileText, FiUser, FiBriefcase, FiCreditCard, 
  FiAlertCircle, FiClipboard, FiFile, FiTrendingUp, FiDollarSign
} from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const [userData, setUserData] = useState({ email: '', role: '' });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          setUserData({
            email: decoded.email || '',
            role: decoded.role || '' // 'admin' o 'vendedor'
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // --- MAPEO DE ENLACES (Ordenado según tu estructura original) ---
  const menuItems = [
    { label: 'Asesores', href: '/user', icon: FiUser, show: userData.role === 'admin' },
    { label: 'Calendario', href: '/calendario', icon: FiCalendar, show: true },
    
    // CAMBIO AQUÍ: 'show: true' permite que el vendedor también vea el catálogo
    { label: 'Productos', href: '/productos', icon: FiBox, show: true },    
    
    { label: 'Prospectos', href: '/prospectos', icon: FiClipboard, show: true },
    { label: 'Cotización', href: '/cotizacion', icon: FiFileText, show: true },
    { label: 'Clientes', href: '/clientes', icon: FiUsers, show: true },
    { label: 'Ventas', href: '/ventas', icon: FiTrendingUp, show: true },
    { label: 'Créditos', href: '/creditos', icon: FiCreditCard, show: true },
    { label: 'Cobranza', href: '/cobranza', icon: FiDollarSign, show: true },
    
    // Solo Admin ve el Panel de Reportes Consolidado
    { label: 'Reporte General', href: '/reportes2', icon: FiBriefcase, show: userData.role === 'admin' },
    
    { label: 'Incidencias', href: '/incidencias', icon: FiAlertCircle, show: true },  
    { label: 'PDF', href: '/archivos', icon: FiFile, show: true },
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
                  {item.icon && <item.icon className={`text-xl min-w-[24px] ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />}
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