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
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.json());

let usersOnLine = [];

app.get('/', async (_req, res) => {
  console.log('LINHA 33 USERS ONLINE:', usersOnLine);
  const nickname = faker.name.findName();
  const allMessages = await getMessages();
  res.status(200).render('index', { nickname, usersOnLine, allMessages });
});

io.on('connection', async (socket) => {
  console.log('Made socket connection', socket.id);
  const userId = socket.id;

  socket.on('user connected', (nickname) => {
    const users = { userId, nickname };
    usersOnLine.push(users);
    io.emit('online users', usersOnLine); // send to all users that are connected
    console.log('LINHA 50', usersOnLine);
  });

  socket.on('saveNickname', (nick) => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
    usersOnLine.push({ userId: socket.id, nickname: nick });
    io.emit('online users', usersOnLine);
    console.log('Line 57 - usersOnLine:', usersOnLine);
  });

  // Handle chat event
  socket.on('message', async ({ nickname, chatMessage, target }) => {
    const realTime = moment(new Date()).format('DD-MM-YYYY hh:mm:ss');
    if (!target) {
      const msgFormated = `${realTime} - ${nickname}: ${chatMessage}`;
      console.log('server L64', msgFormated);
      await saveMessages(msgFormated);
      io.emit('message', msgFormated);
    }
    const msgFormated = `${realTime} (private message) - ${nickname}: ${chatMessage}`;
    io.to(target).to(socket.id).emit('message', msgFormated, target, nickname);
  });

  socket.on('disconnect', () => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
    io.emit('online users', usersOnLine);
  });
});

server.listen(3000, () => console.log('Listening on port 3000'));
