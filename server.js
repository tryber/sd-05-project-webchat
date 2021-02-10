// Muito suporte do repositório da Juliette, Dandrea e do Felipão!

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dateformat = require('dateformat');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

app.use(cors());

const { createMessage, getMessages } = require('./models/messagesModel');

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', './views');

let onlineUsers = [];
let userNumber = 0;

app.get('/', async (_req, res) => {
  const allMessages = await getMessages();
  res.status(200).render('index', { allMessages, onlineUsers });
});

io.on('connection', (socket) => {
  userNumber += 1;

  const currentUserId = socket.id;
  const userName = `User ${userNumber}`;

  onlineUsers.unshift({ id: currentUserId, nickname: userName });

  socket.emit('seeUserId', currentUserId);

  socket.emit('seeUserName', userName);

  io.emit('userConnected', currentUserId, userName);

  socket.on('userChangedNickname', (newNickname) => {
    onlineUsers = onlineUsers.map((user) => {
      if (user.id === currentUserId) {
        const userToChange = user;
        userToChange.nickname = newNickname;
        return userToChange;
      }
      return user;
    });
    io.emit('showChangedNickname', currentUserId, newNickname);
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const dateNow = new Date();
    const date = dateformat(dateNow, 'dd-mm-yyyy');
    const hour = dateformat(dateNow, 'HH:mm:ss');
    const fullMessage = `${date} ${hour} - ${nickname}: ${chatMessage}`;
    await createMessage({ date, hour, nickname, chatMessage });
    io.emit('message', fullMessage);
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.id !== currentUserId);
    io.emit('userDisconnected', currentUserId);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Ouvindo a porta ${PORT}`);
});
