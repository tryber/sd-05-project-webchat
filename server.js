const express = require('express');
const app = require('express')();
// const path = require('path');
const http = require('http').createServer(app);
const cors = require('cors');
const dateFormat = require('dateformat');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

const messagesModel = require('./models/Messages');

app.set('view engine', 'ejs');

app.set('views', './views');

app.use(express.static('./'));

app.use(cors());

app.get('/', async (req, res) => {
  const messages = await messagesModel.getAll();
  res.status(200).render('messages/index', { messages });
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => console.log('User desconnected'));

  socket.on('message', async ({ chatMessage, nickname }) => {
    const timeStamp = dateFormat(new Date(), 'dd-mm-yyyy HH:mm:ss');
    await messagesModel.create(nickname, chatMessage, timeStamp);
    io.emit('message', `${timeStamp} ${nickname} ${chatMessage}`);
  });
});

const PORT = 3000;

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
