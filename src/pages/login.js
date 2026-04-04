import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import '../app/globals.css';

export default function Login() {
    const [name, setName] = useState('');  // Cambiar email por name
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

   const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    try {
      const { data } = await axios.post('/api/login', { name, password });
      
      localStorage.setItem('token', data.token);

      const decodedToken = jwt.decode(data.token);
      
      if (!decodedToken) throw new Error("Invalid Token");

      
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('userName', decodedToken.name);

      if (decodedToken.role === 'admin' || decodedToken.role === 'gerencia') {
        router.push('/calendario'); // Tu nuevo componente maestro
      } else if (decodedToken.name.includes('Logistica')) {
        router.push('/servicios');
      } else {
        router.push('/clientes');
      }

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error de conexión con el servidor';
      setError(msg);
    }
};
    
      
    

    return (
        <div className="min-h-screen bg-[#0e1624] flex items-center justify-center">
            <form className="bg-white p-8 rounded-lg shadow-lg w-80" onSubmit={handleLogin}>
                <div className="flex justify-center mb-6">
                    <img src="/logo_mr.png" alt="Logo" className="h-12" />
                </div>
                <h2 className="text-center text-gray-700 font-bold mb-2">Nombre</h2>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="nombre_"
                className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                autoComplete="username"  // Cambia "autocomplete" a "autoComplete"
                />
                <h2 className="text-center text-gray-700 font-bold mb-2">Contraseña</h2>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="contraseña_"
                    className="w-full p-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    autoComplete="current-password"  // Cambia "autocomplete" a "autoComplete"
                    />
                <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl transition duration-300">
                    Acceder
                </button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>
        </div>
    );
}
