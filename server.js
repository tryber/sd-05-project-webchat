const express = require('express');
const app = require('express')();
const path = require('path');
const http = require('http').createServer(app);
const cors = require('cors');

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
  // await db.collection('messages').insertOne({ message: 'test', nickname:  });
  // console.log(db)
  // db.messages.insertOne({ nickname: 'calado', message: 'hehehe' });
  res.sendFile(path.join(__dirname, '/index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected');

  // socket.emit('ola', 'Bem vindo fulano, fica mais um cadin, vai ter bolo :)');

  socket.on('disconnect', () => console.log('User desconnected'));

  socket.on('message', async ({ chatMessage, nickname }) => {
    const db = await connection();
    await db.collection('messages').insertOne({ chatMessage, nickname });
    io.emit('mensagemServer', { chatMessage, nickname });
  });

  socket.broadcast.emit('mensagemServer', { mensagem: ' Iiiiiirraaaa! Fulano acabou de se conectar :D' });
});

const PORT = 3000;

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
