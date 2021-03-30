const express = require('express');

const http = require('http');

const app = express();
const httpServer = http.createServer(app);
// const net = require('net');
const cors = require('cors');
const path = require('path');
const moment = require('moment');
const socketIo = require('socket.io');

const model = require('./models/messages');

const io = socketIo(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.use('/', express.static(path.join(__dirname, 'view')));

app.set('view engine', 'ejs');
app.set('views', './view');
let numeros = 0;

const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('Chegou o visitante ', socket.id);
  socket.on('disconnect', () => {
    console.log('Visitante', socket.id, ' desconectou');
    delete onlineUsers[socket.id];
    io.emit('updateUser', { onlineUsers });
  });
  socket.on('message', ({ chatMessage, nickname, target }) => {
    const date = moment(new Date()).format('DD-MM-yyyy HH:mm:ss');
    if (target !== '') {
      const stringNewMessage = `${date} (private) - ${nickname}: ${chatMessage}`;
      model.createMessage({ date, nickname, chatMessage, target, user: socket.id });
      return io.to(target).to(socket.id).emit('message', stringNewMessage);  
    }
    const stringNewMessage = `${date} - ${nickname}: ${chatMessage}`;
    model.createMessage({ date, nickname, chatMessage, target: "Everyone" });
    io.emit('message', stringNewMessage);
  });
  socket.on('user', ({ myData }) => {
    myData.socketId = socket.id;
    onlineUsers[myData.socketId] = { ...myData, socketId: socket.id };
    io.emit('updateUser', { onlineUsers });
  });
  socket.on('changeName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUser', { onlineUsers });
  });
  // socket.on('pvtmessage', ({ myData, chatMessage }) => {
  //   const date = moment(new Date()).format('DD-MM-yyyy HH:mm:ss');
  //   const stringNewMessage = `${date} - ${nickname}: ${chatMessage}`;
  //   model.createMessage({ date, nickname, chatMessage, target: myData.socketId });
  //   io.to(myData.socketId).emit(stringNewMessage)
  // })
});

app.get('/', async (_req, res) => {
  const messages = await model.getMessage();
  res.status(200).render('view', { numeros, onlineUsers, messages });
  numeros += 1;
});

const PORT = 3000;
httpServer.listen(PORT, () =>
  console.log(`chatinho do bol rolando na ${PORT}`));
