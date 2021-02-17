require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const messageModel = require('./models/messageModel');

app.use(cors());
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const getM = await messageModel.getMessages();
  return res.render('index.ejs', { getM });
});

io.on('connection', async (socket) => {
  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', socket.id);
  });

  socket.on('message', async (message) => {
    const createMessage = await messageModel.createMessage(message.nickname, message.chatMessage);
    const formatedMessage = `${createMessage.time}- ${createMessage.nickname}: ${createMessage.chatMessage}`;
    io.emit('message', formatedMessage);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Listening server at port:${PORT}`);
});
