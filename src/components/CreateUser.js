import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function CreateUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [userRole, setUserRole] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', {
        name,
        email,
        password,
        role,
      });
      alert('User created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
    } catch (error) {
      console.error('There was an error creating the user!', error);
    }
  };

  // Si el usuario no tiene el rol adecuado, mostrar un mensaje de acceso denegado
  if (userRole !== 'admin' && userRole !== 'gerencia') {
    return <p>No tienes permiso para crear usuarios.</p>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create User</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
            <option value="gerencia">Gerencia</option>
            <option value="coordinador">Coordinador</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
