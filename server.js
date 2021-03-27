const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
// const moment = require('moment');

const app = express();

// require socket.io e protocolo http
const socketIo = require('socket.io');
const http = require('http');
// const { update } = require('lodash');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server, {
  cors: {
    // url aceita pelo
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    // Métodos aceitos pela url
  },
});

app.use(bodyParser.json());
app.use(cors());

// require models mensagens
// const { createMessage, getMessages } = require('./models/messagesModel');

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'public')));
// por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', path.join(__dirname, 'public'));

const onlineUsers = {};

io.on('connection', (socket) => {
  const socketId = socket.id;
  console.log(`Socket conectado: ${socketId}`);
  io.emit('conectado', `${socketId}`);
  socket.on('disconnect', () => {
    console.log(`${socketId} está desconectado`);
  });

  socket.on('message', ({ chat }) => {
    io.emit('updateMessage', { chat });
  });

  socket.on('displayName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
    // console.log(onlineUsers);
  });

  // MENSAGEM DENTRO DO MODEL getMessages
  // const messages = await getMessages();
  // Cria sala PUBLIC
  // io.to(socket.id).emit('displayHistory', messages, 'public');

  // USUARIO ATUAL = usar em mudar usuario
  // socket.on('userConnection', (currentUser) => {
  //   onlineUsers[socketId] = currentUser;
  //   io.emit('displayUsers', onlineUsers);
  // });

  // NICKNAME
  // socket.on('updateNick', (nickname) => {
  //   onlineUsers[socketId] = nickname;
  //   io.emit('displayUsers', onlineUsers);
  // });

  // Disconnect ANTIGO
  // socket.on('disconnect', () => {
  //   delete onlineUsers[socketId];
  //   io.emit('displayUsers', onlineUsers);
  // });

  // CRIA CHAT MESSAGEM PUBLIC COM (nickname, chatMessage, addresse)

  // socket.on('message', async ({ nickname, chatMessage, addressee }) => {
  //   let msg;
  //   if (!addressee) {
  //     msg = await createMessage({
  //       nickname,
  //       message: chatMessage,
  //       timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
  //     });
  //     io.emit('message', `${msg.timestamp} - ${nickname}: ${chatMessage}`, 'public');
  //   } else {
  //     // CRIAR MENSAGEM PRIVATA
  //     msg = await createPrivateMessage({
  //       nickname,
  //       message: chatMessage,
  //       timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
  //       addressee,
  //     });

  // SALA PRIVATE

  // https://socket.io/docs/v3/rooms/
  // io.to(socketId)
  //   .to(addressee)
  //   .emit('message', `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`, 'private');
  // }
  // });
});
let numeros = 0;
app.get('/', async (_req, res) => {
  // app.get('/', (_req, res) => {
  const getAllMessages = [{ nome: 'BATE PAPO UOL', sala: 'sala: + 18' }];
  // const getAllMessages = await getMessages();
  // console.log(getAllMessages);
  // return res.status(200).render('index', { getAllMessages, onlineUsers });
  res.status(200).render('index', { getAllMessages, onlineUsers, numeros });
  numeros += 1;
});

const PORT = 3000;
server.listen(PORT, () => console.log(`ICQ balançou a tela na porta ${PORT}, saudades!!!.`));
