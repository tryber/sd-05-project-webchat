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
// const { remove } = require('lodash');

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.json());

let usersOnLine = [];

app.get('/', async (_req, res) => {
  let nickname = faker.name.findName();
  const allMessages = await getMessages();
  res.status(200).render('index', { nickname, usersOnLine, allMessages });
});

io.on('connection', (socket) => {
  console.log('Made socket connection', socket.id);

  let userId = socket.id;

  socket.on('connected', (nickname) => {
    usersOnLine.push({ userId, nickname });
    io.emit('userConnected', usersOnLine); // send to all users that are connected
    console.log(usersOnLine);
  });

  socket.on('saveNickname', (nick) => {
    const id = socket.id;
    usersOnLine = usersOnLine.filter((user) => user.userId !== id);
    usersOnLine.push({ userId: id, nickname: nick });
    io.emit('userConnected', usersOnLine);
    console.log('Line 51 - usersOnLine:', usersOnLine);
  });

  // Handle chat event
  socket.on('message', async (data) => {
    console.log(data);
    const { chatMessage, nickname } = data;
    const realTime = moment(new Date()).format('DD MM YYYY hh:mm:ss');
    const msgFormated = `${realTime} - ${nickname}: ${chatMessage}`;
    console.log('server L64', msgFormated);
    io.emit('message', msgFormated);
    // await saveMessages(msgFormated);
  });

  socket.on('disconnect', () => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
    io.emit('userConnected', usersOnLine);
  });

  //   socket.emit('usersOnline', usersOnLine);

  //   // socket.emit('privateChat', nickName);

  //   // Handle typing event
  //   // socket.on('typing', function (data) {
  //   //   socket.broadcast.emit('typing', data);
  //   // });
});

server.listen(3000, () => console.log('Listening on port 3000'));
