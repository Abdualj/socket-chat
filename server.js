import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));

// keep track of which room + nickname each socket used, for the "left" message
const socketInfo = new Map();

io.on('connection', (socket) => {
  socket.on('join room', ({ room, nickname }) => {
    socket.join(room);
    socketInfo.set(socket.id, { room, nickname });

    socket.to(room).emit('chat message', {
      nickname: 'System',
      text: `${nickname} joined the room`,
      system: true,
    });
  });

  socket.on('chat message', (text) => {
    const info = socketInfo.get(socket.id);
    if (!info) return; // client hasn't joined a room yet

    io.to(info.room).emit('chat message', {
      nickname: info.nickname,
      text,
      system: false,
    });
  });

  socket.on('disconnect', () => {
    const info = socketInfo.get(socket.id);
    if (info) {
      socket.to(info.room).emit('chat message', {
        nickname: 'System',
        text: `${info.nickname} left the room`,
        system: true,
      });
      socketInfo.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
