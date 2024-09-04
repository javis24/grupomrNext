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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');  // Recupera el token desde localStorage
        const response = await axios.get('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`  // Incluye el token en el encabezado
          }
        });
        setUsers(response.data);
        setError('');  // Clear any previous errors
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      }
    };
  
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <button onClick={openModal} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
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
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
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

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add New User"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Add New User</h2>
        <CreateUser closeModal={closeModal} />
        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Close
        </button>
      </Modal>
    </div>
  );
}
