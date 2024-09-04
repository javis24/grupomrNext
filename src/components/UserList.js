import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import CreateUser from './CreateUser';

// Establecer los estilos del modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    padding: '20px',
  },
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Nuevo estado para el usuario seleccionado
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${selectedUser.id}`, {
        name,
        password,
        role,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Actualizar la lista de usuarios
      setUsers(users.map((user) =>
        user.id === selectedUser.id ? { ...user, name, role } : user
      ));

      closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setName(user.name);
    setPassword(''); // Dejar en blanco para que el usuario ingrese un nuevo password
    setRole(user.role);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <button onClick={() => openModal({})} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add New
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search for a user"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Created at</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-[#374151]">
              <td className="px-4 py-2 flex items-center">
                <img
                  src={user.avatar || '/logo_mr.png'}
                  alt={user.name}
                  className="h-10 w-10 rounded-full mr-2"
                />
                {user.name}
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">
                <button onClick={() => openModal(user)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para actualizar usuario */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit User"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{selectedUser && selectedUser.id ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
              placeholder="Enter new password"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
              required
            >
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
            {selectedUser && selectedUser.id ? 'Update User' : 'Create User'}
          </button>
        </form>
        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Close
        </button>
      </Modal>
    </div>
  );
}
