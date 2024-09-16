import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket;

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Conectar a Socket.io en el nuevo endpoint
    socket = io('/api/chat/socket');

    // Escuchar los mensajes del servidor
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      // Enviar el mensaje al servidor
      socket.emit('message', message);
      setMessage(''); // Limpiar el input
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Chat en tiempo real</h2>
      <div className="chat-window mb-4 p-4 bg-gray-900 h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="my-2 p-2 bg-gray-700 rounded-md">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-green-500 rounded text-white"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
