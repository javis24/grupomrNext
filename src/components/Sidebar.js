import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';

export default function Sidebar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#1f2937] p-5 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && <img src="/logo_mr.png" alt="Logo" className="h-10" />}
        {!isCollapsed && <span className="text-xl font-bold ml-2">GrupoMrLaguna</span>}
      </div>
      <nav>
      <button
          onClick={toggleSidebar}
          className="bg-white text-center w-full rounded-2xl h-14 relative font-sans text-black text-xl font-semibold group"
        >
      <div
        className="bg-[#1f2937] rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-full z-10 duration-500"
      >
        <svg
          width="25px"
          height="25px"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#000000"
            d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
          ></path>
          <path
            fill="#000000"
            d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
          ></path>
        </svg>
      </div>
      <p className="translate-x-2">Menu</p>
      <span
        className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform duration-300 ease-in-out ${isCollapsed ? 'translate-x-0' : 'translate-x-6'}`}
      />
    </button>

    
        <ul>
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
