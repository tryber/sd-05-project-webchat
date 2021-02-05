const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(`${__dirname}/public/`));

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const messageModel = require('./models/messageModel');

app.get('/', async (_req, res) => {
  const messageHistory = await messageModel.getMessagesHistory();
  return res.render('index', { messageHistory });
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });

  socket.on('message', async (message) => {
    const { ops } = await messageModel.createMessage(message.nickname, message.chatMessage);
    const [messageInDb] = ops;
    const text = `${messageInDb.time} - ${messageInDb.nickname}: ${messageInDb.chatMessage}`;
    io.emit('message', text);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
