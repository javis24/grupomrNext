import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!io) {
    // Solo se inicializa Socket.io si no está ya inicializado
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Manejar la conexión de socket
    io.on('connection', (socket) => {
      console.log('Usuario conectado:', socket.id);

      // Escuchar los mensajes enviados por los clientes
      socket.on('message', (msg) => {
        // Transmitir el mensaje a todos los clientes conectados
        io.emit('message', msg);
      });

      // Desconectar
      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
      });
    });
  }

  res.end();
}
