const moment = require('moment');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const socketIoServer = require('http').createServer(app);
const io = require('socket.io')(socketIoServer);

const { getAllMessages, createMessage } = require('./model/chatModel');

const port = process.env.PORT || 3000;
const onlineUsers = [];

io.on('connect', (socket) => {
  console.log('usuario conectado');
  socket.on('chat', async (message) => {
    const dateNow = new Date().getTime();
    const data = moment(dateNow).format('DD-MM-yyyy h:mm:ss A');
    createMessage(message);
    socket.emit('chat', { ...message, data });
  });
});

app.set('view engine', 'ejs');
app.set('views', './view');
app.use(bodyParser.json());
app.use(cors());

app.get('/', async (_req, res) => {
  const allMessages = await getAllMessages();
  res.status(200).render('chat', { onlineUsers, allMessages });
});

socketIoServer.listen(port, () => {
  console.log('estamos quase online ...');
});
