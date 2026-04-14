import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware para validar JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Autenticación requerida: Token no proporcionado'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Token inválido o expirado'));
    }
    socket.user = decoded; // Asociar el usuario al socket
    next();
  });
});

// Eventos de Socket.IO
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.name} (ID: ${socket.id})`);

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.user.name} (ID: ${socket.id})`);
    });

    socket.on('new-message', (message) => {
        console.log(`Mensaje recibido de ${socket.user.name}: ${message}`);
        io.emit('message', {
            user: socket.user.name,
            text: message,
            timestamp: new Date().toISOString()
        });
    });
});

const PORT = process.env.SOCKET_PORT || 6001;
server.listen(PORT, () => {
    console.log(`Servidor Socket.IO escuchando en el puerto ${PORT}`);
});
