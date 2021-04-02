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
  const messages = await getAllMessages({ targetUser: null });
  res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const tempNickname = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: 'capital',
    separator: '',
  });

  const newUser = { userId, nickname: tempNickname };

  console.log(`User ${userId} - ${tempNickname} connected`);
  onlineUsers.unshift(newUser);
  socket.emit('connected', newUser);
  io.emit('userLoggedIn', newUser);

  socket.on('disconnect', () => {
    const index = onlineUsers.findIndex((user_) => user_.userId === userId);

    console.log(`User ${userId} - ${tempNickname} disconnected`);
    onlineUsers.splice(index, 1);
    io.emit('userLoggedOff', userId);
  });

  socket.on('message', async (msg) => {
    const isPrivate = msg.targetUser ? '(private)' : '';
    const timestamp = moment().format('DD-MM-YYYY hh:mm:ss A');
    const msgString = `${timestamp} - ${msg.nickname}${isPrivate}: ${msg.chatMessage}`;

    await addMessage({ ...msg, timestamp });
    if (isPrivate !== '') io.to(msg.targetUser).to(msg.userId).emit('message', msgString);
    else io.emit('message', msgString);
  });

  socket.on('nicknameChange', (user) => {
    const index = onlineUsers.findIndex((user_) => user_.userId === user.userId);
    const onlineUser = onlineUsers[index];

    console.log(`User ${user.userId} changed nickname from ${onlineUser.nickname} to ${user.nickname}.`);
    onlineUser.nickname = user.nickname;
    io.emit('nicknameChanged', onlineUser);
  });

  socket.on('getPublicHistory', async () => {
    const messages = await getAllMessages({ targetUser: null });
    socket.emit('publicHistory', messages);
  });

  socket.on('getPrivateHistory', async (targetUser) => {
    const query = {
      targetUser: { $ne: null },
      $or: [{ targetUser }, { userId: targetUser }],
    };
    const messages = await getAllMessages(query);
    socket.emit('privateHistory', messages);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => console.log(`Listening on port ${PORT}`));
