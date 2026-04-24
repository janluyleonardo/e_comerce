import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pg from 'pg';

// Cargar variables de entorno
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

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
    socket.user = decoded; // Asociar el usuario al socket (incluye sub, name, role)
    next();
  });
});

// Eventos de Socket.IO
io.on('connection', async (socket) => {
    console.log(`[CONEXIÓN] Usuario conectado: ${socket.user.name} (ID: ${socket.id})`);

    // Enviar los últimos 10 mensajes al conectarse (Actividad 3)
    try {
        const history = await pool.query(
            'SELECT m.*, u.name as user FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC LIMIT 10'
        );
        socket.emit('messages', history.rows.reverse());
    } catch (err) {
        console.error('[ERROR DB] Al obtener historial:', err);
    }

    socket.on('disconnect', () => {
        console.log(`[DESCONEXIÓN] Usuario desconectado: ${socket.user.name} (ID: ${socket.id})`);
    });

    socket.on('new-message', async (message) => {
        console.log(`[CHAT] Mensaje de ${socket.user.name}: ${message}`);
        
        try {
            // Persistencia en DB (Actividad 2)
            // 'sub' es el ID de usuario estándar en JWT de Laravel
            const res = await pool.query(
                'INSERT INTO messages (user_id, text, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
                [socket.user.sub, message]
            );

            // Broadcast a todos (incluida la persistencia)
            io.emit('message', {
                id: res.rows[0].id,
                user: socket.user.name,
                user_id: socket.user.sub,
                text: message,
                timestamp: res.rows[0].created_at
            });

            console.log(`[DB] Mensaje guardado en base de datos.`);
        } catch (err) {
            console.error('[ERROR DB] No se pudo guardar el mensaje:', err);
        }
    });
});

const PORT = process.env.SOCKET_PORT || 6001;
server.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`SERVIDOR SOCKET.IO ACTIVO EN PUERTO: ${PORT}`);
    console.log(`Conectado a DB: ${process.env.DB_DATABASE}`);
    console.log(`=================================================\n`);
});
