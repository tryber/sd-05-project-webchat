const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const path = require('path');
const cors = require('cors');
const moment = require('moment');
const faker = require('faker');

const { saveMessages, getMessages } = require('./model/webChatModel');

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.json());

let usersOnLine = [];

app.get('/', async (_req, res) => {
  const nickname = faker.name.findName();
  const allMessages = await getMessages();
  console.log('LINHA 32', usersOnLine);
  res.status(200).render('index', { nickname, usersOnLine, allMessages });
});

io.on('connection', async (socket) => {
  console.log('Made socket connection', socket.id);

  socket.on('connected', (nickname) => {
    usersOnLine.push(nickname);
    io.emit('userConnected', usersOnLine); // send to all users that are connected
    console.log(usersOnLine);
  });

  socket.on('saveNickname', (nick) => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
    usersOnLine.push({ userId: socket.id, nickname: nick });
    io.emit('userConnected', usersOnLine);
    console.log('Line 51 - usersOnLine:', usersOnLine);
  });

  // Handle chat event
  socket.on('message', async ({ nickname, chatMessage }) => {
    console.log('LINHA 57 ', chatMessage, nickname);
    const realTime = moment(new Date()).format('DD-MM-YYYY hh:mm:ss');
    const msgFormated = `${realTime} - ${nickname}: ${chatMessage}`;
    console.log('server L64', msgFormated);
    io.emit('message', msgFormated);
    await saveMessages(msgFormated);
  });

  socket.on('private-message', (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit('private message', socket.id, msg);
  });

  socket.on('disconnect', () => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
    io.emit('userConnected', usersOnLine);
  });

  // socket.emit('privateChat', nickName);

  // socket.on('typing', function (id) {
  //   const currentUser = usersOnLine.find((user) => user.userId === id);
  //   socket.broadcast.emit('typing', currentUser);
  // });
});

server.listen(3000, () => console.log('Listening on port 3000'));
