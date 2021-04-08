const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const moment = require('moment');
const socketIo = require('socket.io');
const { createMessage, getMessages, getPrivateMessages } = require('./model');

const app = express();
app.use(express.json());
const httpServer = http.createServer(app);

// quase certeza que socket io suporta cors mas tarde pra testar
const io = socketIo(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

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
  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('updateUser', { onlineUsers });
  });
  socket.on('message', ({ chatMessage, nickname, target = '' }) => {
    const date = moment(new Date()).format('DD-MM-yyyy HH:mm:ss');
    if (target !== '') {
      const stringNewMessagePrivate = `${date} (private) - ${nickname}: ${chatMessage}`;
      createMessage({
        date,
        nickname,
        chatMessage,
        target,
        user: socket.id,
      });
      return io.to(target).to(socket.id).emit('message', stringNewMessagePrivate);
    }
    const stringNewMessage = `${date} - ${nickname}: ${chatMessage}`;
    createMessage({ date, nickname, chatMessage, target: 'Everyone' });
    io.emit('message', stringNewMessage);
  });
  socket.on('user', ({ myData: old }) => {
    const myData = old;
    myData.socketId = socket.id;
    onlineUsers[myData.socketId] = { ...myData, socketId: socket.id };
    io.emit('updateUser', { onlineUsers });
  });
  socket.on('changeName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUser', { onlineUsers });
  });
});

app.get('/', async (_req, res) => {
  const messages = await getMessages();
  res.status(200).render('view', { numeros, onlineUsers, messages });
  numeros += 1;
});

// baseado na ideia de rotas do Sid <3
app.get('/chatprivate/:user/:target', async (req, res) => {
  const { target, user } = req.params;
  const messages = await getPrivateMessages(target, user);
  res.status(200).json(messages);
});

app.get('/chat', async (_req, res) => {
  const messages = await getMessages();
  res.status(200).json(messages);
});

const PORT = 3000;
httpServer.listen(PORT, () => console.log(`listennig @${PORT}`));
