const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const path = require('path');

const moment = require('moment');

const app = express();

const socketIo = require('socket.io');

const http = require('http');

const server = http.createServer(app);

const io = socketIo(server);

const PORT = process.env.PORT || 3000;

const { createMessage, getAll } = require('./models/Message');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

let usersOnline = [];

app.get('/', async (req, res) => {
  const messages = await getAll();
  res.render(path.join(__dirname, './views/index.ejs'), { messages, usersOnline });
});

io.on('connection', (socket) => {
  console.log('User connected.');
  const userId = socket.id;
  const userNickname = `Guest ${Math.ceil(Math.random() * 1000)}`;

  usersOnline.push({ nickname: userNickname, userId: socket.id });
  socket.emit('saveId', socket.id);
  io.emit('listOfUsers', userNickname, userId);

  socket.on('disconnect', () => {
    console.log('User disconnected.');
    usersOnline = usersOnline.filter((user) => user.userId !== userId);
    io.emit('userDisconnected', userId);
  });

  socket.on('changeNickname', (newNickname) => {
    usersOnline = usersOnline.map((user) => {
      if (user.userId === userId) {
        const newUser = user;
        newUser.nickname = newNickname;
        return newUser;
      }
      return user;
    });

    io.emit('changeNickname', newNickname, userId);
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss A');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });
    io.emit('message', message);
  });
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}.`));
