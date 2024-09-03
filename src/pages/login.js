import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../app/globals.css';

export default function Login() {
    const [name, setName] = useState('');  // Cambiar email por name
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/login', { name, password });  // Usar name en lugar de email
            console.log(data); 
    
            // Almacenar el token en localStorage
            localStorage.setItem('token', data.token);
    
            // Redireccionar al dashboard
            router.push('/dashboard'); 
        } catch (error) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0e1624] flex items-center justify-center">
            <form className="bg-white p-8 rounded-lg shadow-lg w-80" onSubmit={handleLogin}>
                <div className="flex justify-center mb-6">
                    <img src="/logo_mr.png" alt="Logo" className="h-12" />
                </div>
                <h2 className="text-center text-gray-700 font-bold mb-2">Name</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
                <h2 className="text-center text-gray-700 font-bold mb-2">Password</h2>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full p-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
                <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl transition duration-300">
                    Login
                </button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>
        </div>
    );
}
