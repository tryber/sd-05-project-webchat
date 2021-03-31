const moment = require('moment');
const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require('unique-names-generator');

const { addMessage, getAllMessages } = require('./models/Message');

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', './views');

const onlineUsers = [];

app.get('/', async (_req, res) => {
  const messages = await getAllMessages();
  res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const tempNickname = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: 'capital',
    separator: '',
  });

  onlineUsers.unshift({ userId, nickname: tempNickname });

  console.log(`User ${userId} - ${tempNickname} connected`);
  socket.emit('connected', { userId, nickname: tempNickname });
  io.emit('userConnected', userId, tempNickname);

  socket.on('disconnect', () => {
    console.log(`User ${userId} - ${tempNickname} disconnected`);
    const userIndex = onlineUsers.findIndex((user) => user.userId === userId);
    onlineUsers.splice(userIndex, 1);
    io.emit('userDisconnected', userId);
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const timestamp = moment().format('DD-MM-YYYY hh:mm:ss A');
    await addMessage({ chatMessage, nickname, timestamp });
    const msgString = `${timestamp} - ${nickname}: ${chatMessage}`;
    io.emit('message', msgString);
  });

  socket.on('nicknameChange', ({ nickname, userId: userId_ }) => {
    const userIndex = onlineUsers.findIndex((user) => user.userId === userId_);
    const user = onlineUsers[userIndex];

    console.log(`User ${user.userId} change nickname from ${user.nickname} para ${nickname}.`);
    user.nickname = nickname;
    io.emit('nicknameChanged', nickname, userId_);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => console.log(`Listening on port ${PORT}`));
