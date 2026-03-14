import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';

// Estilos del modal mejorados para que se adapten a móvil
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '500px',
    color: 'white'
  },
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUserRole(decoded.role);
      } catch (e) {
        console.error("Token inválido");
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUsers(response.data);
      setError('');
    } catch (error) {
      setError('No se pudieron cargar los usuarios. Reintenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userId));

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      setUsers(previousUsers);
      setError('Error al eliminar. El usuario podría estar vinculado a otros registros.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userData = { name, email, role };
    if (password) userData.password = password;

    try {
      if (selectedUser) {
        await axios.put(`/api/users/${selectedUser.id}`, userData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/users', userData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      setError('Error al procesar la solicitud. Verifica los datos.');
    }
  };

  const openModal = (user = null) => {
    setSelectedUser(user);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
    setPassword('');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
    setError('');
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (userRole !== 'admin' && userRole !== 'gerencia') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e1624] text-white p-4 text-center">
        <p className="bg-red-900/20 p-4 rounded-lg border border-red-500">No tienes permisos para gestionar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm">Administra los accesos de tu equipo</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
        >
          + Añadir Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pl-4 rounded-xl bg-[#1f2937] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Vista de Tabla (Desktop) / Cards (Mobile) */}
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#1f2937]">
        <table className="w-full hidden md:table">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rol</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-gray-300">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(user)} className="text-sm bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-md transition-all">Editar</button>
                  <button onClick={() => handleDelete(user.id)} className="text-sm bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-md transition-all">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Layout para Móvil */}
        <div className="md:hidden divide-y divide-gray-700">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400">
                  {user.role}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(user)} className="flex-1 bg-green-600 py-2 rounded-lg text-sm font-medium">Editar</button>
                <button onClick={() => handleDelete(user.id)} className="flex-1 bg-red-600 py-2 rounded-lg text-sm font-medium">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Profesional */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        ariaHideApp={false}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{selectedUser ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#374151] border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#374151] border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="correo@empresa.com"
              required={!selectedUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#374151] border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={selectedUser ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
              required={!selectedUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Rol de Usuario</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#374151] border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Seleccionar Rol</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="gerencia">Gerencia</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-all"
            >
              {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
            <button 
              type="button"
              onClick={closeModal} 
              className="w-full bg-transparent hover:bg-gray-700 text-gray-400 p-2 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}