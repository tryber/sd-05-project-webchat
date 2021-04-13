const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moment = require('moment');

const app = express();

const socketIo = require('socket.io');
const http = require('http');
const { createMessage, getMessages, getPrivateMessages } = require('./models/messagesModel.js');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const onlineUsers = {};
let numeros = 0;

io.on('connection', (socket) => {
  const socketId = socket.id;
  console.log(`${socketId} se conectou.`);

  socket.on('newUserConectando', ({ myData: old }) => {
    const myData = old;
    myData.socketId = socket.id;
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socketId];
    io.emit('updateUsers', { onlineUsers });
    console.log(`${socketId} desconectou.`);
  });

  socket.on('message', ({ chatMessage, nickname, target = '' }) => {
    const data = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    if (target !== '') {
      const newMessage = `${data} (private) - ${nickname}: ${chatMessage}`;
      createMessage(newMessage, socket.id, target);
      return io.to(target).to(socket.id).emit('message', newMessage);
    }
    const newMessage = `${data} - ${nickname}: ${chatMessage}`;
    createMessage(newMessage);
    return io.emit('message', newMessage);
  });

  socket.on('displayName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
  });
});

app.get('/', async (_req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).render('index', { getAllMessages, onlineUsers, numeros });
  numeros += 1;
});

app.get('/private/:target/:origin', async (req, res) => {
  const { target, origin } = req.params;
  const getAllMessages = await getPrivateMessages(target, origin);
  res.status(200).json(getAllMessages);
});

app.get('/chat', async (_req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).json(getAllMessages);
});

const PORT = 3000;
server.listen(PORT, () => console.log('Oou vc tem uma nova conversa'));
