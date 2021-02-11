const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const ioServer = require('http').createServer(app);
const io = require('socket.io')(ioServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const chatModel = require('./model/usersModel');

const d = new Date();
const date = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()} PM`;

app.set('view engine', 'ejs');

app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let usersOn = [];

app.get('/', async (_req, res) => {
  const messagesArray = await chatModel.getAll();
  console.log(messagesArray);
  res.status(200).render('history', { messagesArray, usersOn });
});

io.on('connection', (socket) => {
  const userID = socket.id;
  const newUser = 'randomName';
  console.log(`${socket.id} conectado`);
  usersOn.unshift({ userID, nickname: newUser });

  socket.emit('Connected', userID);
  io.emit('connected', userID, newUser);

  socket.on('nickChange', (userId, nickname) => {
    console.log(`user id server ${userId}`);
    usersOn = usersOn.filter((user) => user.userID !== userId);
    usersOn.push({ userID: userId, nickname });
    io.emit('nickChange', ({ userId, nickname }));
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} desconectado`);
    usersOn = usersOn.filter((user) => user.userID !== userID);
    io.emit('disconnected', userID);
  });

  socket.on('message', async (msg) => {
    console.log(msg);
    await chatModel.createUser(date, msg.nickname === '' ? 'radomName' : msg.nickname, msg.chatMessage);
    io.emit('message', `${date} ${msg.nickname === '' ? 'radomName' : msg.nickname}: ${msg.chatMessage}`);
  });
});

ioServer.listen(3000, () => console.log('socketio funfando na porta 3000'));
