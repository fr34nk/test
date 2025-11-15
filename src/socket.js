const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing; in production, specify your frontend URL
    methods: ["GET", "POST", "PUT"]
  }
});

// Serve a basic route
app.get('/', (req, res) => {
  res.send('Socket.IO server running');
});

// Listen for client connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a custom event
  socket.on('message', (data) => {
    console.log('Received message:', data);

    // Broadcast to all clients except sender
    socket.broadcast.emit('message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
