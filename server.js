// Desenvolvimento em conjuto do Rafão t05 =  PR #31

const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
// const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment');

const app = express();

// require socket.io e protocolo http
const http = require('http');
const socketIo = require('socket.io');

// require models mensagens
const { createMessage, createPrivateMessage, getMessages } = require('./models/messagesModel');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server);

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'views')));
// // por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', './public');

const onlineUsers = {};

// concectando socket
io.on('connection', async (socket) => {
  const socketId = socket.id;
  const messages = await getMessages();
  io.to(socket.id).emit('displayHistory', messages, 'public');

  socket.on('userConnection', (currentUser) => {
    onlineUsers[socketId] = currentUser;
    io.emit('displayUsers', onlineUsers);
  });

  socket.on('updateNick', (nickname) => {
    onlineUsers[socketId] = nickname;
    io.emit('displayUsers', onlineUsers);
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socketId];
    io.emit('displayUsers', onlineUsers);
  });

  socket.on('message', async ({ nickname, chatMessage, addressee }) => {
    let msg;
    if (!addressee) {
      msg = await createMessage({
        nickname,
        message: chatMessage,
        timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
      });
      io.emit('message', `${msg.timestamp} - ${nickname}: ${chatMessage}`, 'public');
    } else {
      msg = await createPrivateMessage({
        nickname,
        message: chatMessage,
        timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
        addressee,
      });
      // https://socket.io/docs/v3/rooms/
      io.to(socketId)
        .to(addressee)
        .emit('message', `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`, 'private');
    }
  });
});

// // ---------------------------------------------------------------------------------------------
// Endpoint GET para mensagens
// exemplo de ejs response.render('caminho', {objeto no ejs que quer chamar});
app.get('/', async (req, res) => {
  const getAllMessages = await getMessages();
  console.log(getAllMessages);
  return res.status(200).render('index', { getAllMessages, onlineUsers });
});
// ----------------------------------------------------------------------------------------------

const PORT = 3000;
// const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`ICQ balançou a tela na porta ${PORT}, saudades!!!.`));

// Referencias para o projeto
// revisão Vinicius Vasconcelos <https://github.com/tryber/sd-04-live-lectures/pull/67/files>
// Chat em tempo real com NodeJS + Socket.io | Diego Fernandes | Rocketseat <https://www.youtube.com/watch?v=-jXfKDYJJvo>
// Realtime Chat With Users & Rooms - Socket.io, Node & Express <https://www.youtube.com/watch?v=jD7FnbI76Hg>
