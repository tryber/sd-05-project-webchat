const express = require('express');
const path = require('path');
const moment = require('moment');
const faker = require('faker');

const PORT = process.env.PORT || 3000;

const app = express();

const http = require('http');

const httpServer = http.createServer(app);

const cors = require('cors');

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

const messageModel = require('./models/MessageModel');
const { createMessage } = require('./models/MessageModel');

let onlineUsers = [];

app.get('/', async (_req, res) => {
  const message = await messageModel.getAll();
  return res.render('index', { message, onlineUsers });
});

io.on('connection', async (socket) => {
  console.log(`${socket.id} connected`);

  const fakeName = faker.name.firstName();
  onlineUsers.push({ id: socket.id, nickname: fakeName });
  io.emit('onlineUsers', { id: socket.id, onlineUsers });
  socket.emit('nickname', { id: socket.id, nickname: fakeName });

  io.emit('onlineUsers', { id: socket.id, onlineUsers });

  socket.on('changeNick', async (nickname) => {
    socket.emit('nickname', { id: socket.id, nickname });
    onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
    onlineUsers.push({ id: socket.id, nickname });
    io.emit('onlineUsers', { id: socket.id, onlineUsers });
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date().getTime()).format('DD-MM-yyyy hh:mm:ss');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    console.log(message);
    await createMessage({ timestamp, nickname, chatMessage });
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect`);
    const updatedUsers = onlineUsers.filter((user) => user.id !== socket.id);
    onlineUsers = updatedUsers;
    io.emit('onlineUsers', { id: socket.id, onlineUsers });
  });
});

httpServer.listen(PORT, () => console.log('rodando na porta 3000'));
