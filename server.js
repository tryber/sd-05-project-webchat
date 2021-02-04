const express = require('express');
const app = require('express')();
const path = require('path');
const http = require('http').createServer(app);
const cors = require('cors');
const dateFormat = require('dateformat');

const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

const connection = require('./tests/helpers/db');

app.use(express.static('./'));

app.use(cors());

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => console.log('User desconnected'));

  socket.on('message', async ({ chatMessage, nickname }) => {
    const time = dateFormat(new Date(), 'dd-mm-yyyy HH:mm:ss');
    const db = await connection();
    await db.collection('messages').insertOne({ chatMessage, nickname });
    io.emit('message', `${time} ${nickname} ${chatMessage}`);
  });
});

const PORT = 3000;

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
