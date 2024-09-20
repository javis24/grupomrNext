import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { FiMenu, FiX } from 'react-icons/fi'; // Importamos los íconos de hamburguesa y cerrar

export default function Sidebar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true); // Iniciamos el sidebar colapsado

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`${isCollapsed ? 'w-11' : 'w-64'} bg-[#1f2937] p-5 transition-all duration-300 min-h-screen relative`}>
      {/* Icono de hamburguesa en la parte superior para colapsar/desplegar */}
      <div className="absolute top-10 left-2">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none text-3xl" // Ícono de hamburguesa
        >
          {isCollapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      <div className="flex items-center justify-center mb-8 mt-12">
        {!isCollapsed && (
          <Link href="/dashboard">
            <img src="/logo_mr.png" alt="Logo" className="h-10" />
          </Link>
        )}
      </div>
      
      <nav className="mt-10">
        <ul className="mt-4">
          {(userRole === 'admin' || userRole === 'gerencia') && (
            <li className="mb-4">
              <Link href="/user" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Asesores Comerciales'}
              </Link>
            </li>
          )}
          <li className="mb-4">
            <Link href="/reportes-unidad-negocio" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Reportes Unidad Negocio'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/reporte-mensual" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Reportes Mensuales'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/calendario" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Calendario'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/clientes" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Clientes'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/cotizacion" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Cotizaciones'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/servicios" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'RSV'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Creditos'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Incidencias'}
            </Link>
          </li>
          <li className="mb-4">
            <Link href="chat" className="flex items-center p-2 rounded hover:bg-[#374151]">
              {!isCollapsed && 'Chat'}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center p-2 rounded hover:bg-[#374151] text-white w-full text-left"
        >
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
