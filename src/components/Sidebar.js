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
  const [darkMode, setDarkMode] = useState(false);

  // 1. Lógica para inicializar y cambiar el tema
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          setUserData({
            email: decoded.email || '',
            role: decoded.role || '' 
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

  const menuItems = [
    { label: 'Asesores', href: '/user', icon: FiUser, show: userData.role === 'admin' },
    { label: 'Calendario', href: '/calendario', icon: FiCalendar, show: true },
    { label: 'Productos', href: '/productos', icon: FiBox, show: true },    
    { label: 'Prospectos', href: '/prospectos', icon: FiClipboard, show: true },
    { label: 'Cotización', href: '/cotizacion', icon: FiFileText, show: true },
    { label: 'Clientes', href: '/clientes', icon: FiUsers, show: true },
    { label: 'Ventas', href: '/ventas', icon: FiTrendingUp, show: true },
    { label: 'Créditos', href: '/creditos', icon: FiCreditCard, show: true },
    { label: 'Cobranza', href: '/cobranza', icon: FiDollarSign, show: true },
    { label: 'Reporte General', href: '/reportes2', icon: FiBriefcase, show: userData.role === 'admin' },
    { label: 'Incidencias', href: '/incidencias', icon: FiAlertCircle, show: true },  
    { label: 'PDF', href: '/archivos', icon: FiFile, show: true },
  ];

  return (
    /* CAMBIO: bg-white para modo claro, dark:bg-[#111827] para oscuro */
    <aside className={`sticky top-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 transition-all duration-300 flex flex-col shadow-xl border-r border-gray-200 dark:border-gray-800`}>
      
      {/* Botón Toggle Sidebar */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        {!isCollapsed && <img src="/logo_mr.png" alt="Logo" className="h-8 animate-fade-in" />}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl text-blue-600 dark:text-blue-400"
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
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white'}
                  `}
                >
                  {item.icon && <item.icon className={`text-xl min-w-[24px] ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />}
                  {!isCollapsed && (
                    <span className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sección Inferior: Theme Switcher & Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
        
        {/* SWITCH DE TEMA (DISEÑO UI VERSE) */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-2'} mb-2`}>
          <label className="relative inline-flex items-center cursor-pointer scale-75 origin-left">
            <input 
              className="sr-only peer" 
              type="checkbox" 
              checked={darkMode} 
              onChange={toggleTheme} 
            />
            <div
              className="w-20 h-10 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 peer-checked:from-blue-400 peer-checked:to-indigo-500 transition-all duration-500 after:content-['☀️'] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-8 after:w-8 after:flex after:items-center after:justify-center after:transition-all after:duration-500 peer-checked:after:translate-x-10 peer-checked:after:content-['🌙'] after:shadow-md after:text-lg"
            ></div>
            {!isCollapsed && (
              <span className="ml-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {darkMode ? 'Oscuro' : 'Claro'}
              </span>
            )}
          </label>
        </div>

        {/* Botón Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-400 text-gray-500 dark:text-gray-400 w-full transition-all group"
        >
          <FiLogOut className="text-xl min-w-[24px]" />
          {!isCollapsed && <span className="text-sm font-bold uppercase tracking-wider">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}