const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { addMessage, getAllMessages } = require('./models/messagesModel');

// Set Static Folder
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', './views');
app.set('view engine', 'ejs');

let users = [];

app.get('/', async (req, res) => {
  const messages = await getAllMessages();
  res.status(200).render('index', { users, messages });
});

io.on('connection', (socket) => {
  const sessionUserId = socket.id;
  const convidadoNick = `Convidado_${parseInt(Math.random() * 10000, 10)}`;
  console.log(`Connected: ${sessionUserId}`);

  io.emit('connected', { sessionUserId, convidadoNick });

  socket.on('chat message', (msg) => {
    console.log(`message: ${msg}`);
  });

  // socket.on -> 'message' aguardando acionamento do botao Mandar Mensagem enviado pelo main.js
  socket.on('messageServer', async ({ nickname, chatMessage }) => {
    const dateTime = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');

    await addMessage({ nickname, chatMessage, dateTime });
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('messageMain', message);
  });

  socket.on('changeNickname', (nickname) => {
    users = users.filter((user) => user.socketId !== sessionUserId);
    users.push({ socketId: sessionUserId, nickname });
    io.emit('changeNickname', { nickname, socketId: sessionUserId });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
