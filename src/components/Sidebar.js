import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();

  const logout = () => {
    // Eliminar el token JWT de localStorage
    localStorage.removeItem('token');
    // Redirigir al usuario a la página de inicio de sesión
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#1f2937] p-5">
      <div className="flex items-center mb-8">
        <img src="/logo_mr.png" alt="Logo" className="h-10" />
        <span className="text-xl font-bold ml-2">GrupoMrLaguna</span>
      </div>
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/user" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Asesores Comerciales
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/reportes-unidad-negocio" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Reportes Unidad Negocio
            </Link>
          </li>
          <li className="mb-4">
            <Link href="reporte-mensual" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Reportes Mensuales
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/calendario" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Calendario
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/clientes" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Clientes
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/cotizacion" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Cotizaciones
            </Link>
          </li>
          <li className="mb-4">
            <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
              RSV
            </Link>
          </li>
          <li className="mb-4">
            <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Creditos
            </Link>
          </li>
          <li className="mb-4">
            <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
              Incidencias
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center p-2 rounded hover:bg-[#374151] text-white w-full text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
