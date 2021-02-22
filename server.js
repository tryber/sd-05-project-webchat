const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment');

const app = express();

// require socket.io e protocolo http
const socketIo = require('socket.io');
const http = require('http');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server);

// require models mensagens
const { createMessage, getMessages } = require('./models/messagesModel');

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'public')));
// por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', './public');

app.use(bodyParser.json());
app.use(cors());

// concectando socket
io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  io.emit('conectado', `${socket.id}`);
  // mensagens com data e nickname
  socket.on('message', async ({ nickname, chatMessage }) => {
    const dateTime = moment(Date.now()).format('DD-MM-yyyy HH:mm:ss');
    await createMessage(nickname, chatMessage, dateTime);
    // DD-MM-yyyy HH:mm:ss ${message.nickname} ${message.chatMessage}
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });
});

// Endpoint GET para mensagens
app.get('/', async (req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).render('index', { getAllMessages });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`ICQ balançou a tela na porta ${PORT}, saudades!!!.`));

// Referencias para o projeto
// revisão Vinicius Vasconcelos <https://github.com/tryber/sd-04-live-lectures/pull/67/files>
// Chat em tempo real com NodeJS + Socket.io | Diego Fernandes | Rocketseat <https://www.youtube.com/watch?v=-jXfKDYJJvo>
// Realtime Chat With Users & Rooms - Socket.io, Node & Express <https://www.youtube.com/watch?v=jD7FnbI76Hg>
