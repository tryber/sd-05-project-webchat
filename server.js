// const client = require('socket.io').listen(4000).sockets;
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const express = require('express');
const faker = require('faker');
const messagesModel = require('./models/messagesModel');
const createMessageProfile = require('./tests/helpers/createMessageProfile');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));

// const fakename = faker.name.firstName();

app.get('/', async (req, res) => {
  const allMessages = await messagesModel.getAll();

  // socket.emit('newNickName', fakename);

  res.render('index', { allMessages });
});

const userSocketIdMap = new Map();

function addClientToMap(userName, socketId) {
  if (!userSocketIdMap.has(userName)) {
    // when user is joining first time
    userSocketIdMap.set(userName, new Set([socketId]));
  } else {
    // user had already joined from one client and now joining using another client;
    userSocketIdMap.get(userName).add(socketId);
  }
}

function removeClientFromMap(userName, socketId) {
  if (userSocketIdMap.has(userName)) {
    const userSocketIdSet = userSocketIdMap.get(userName);
    userSocketIdSet.delete(socketId);
    // if there are no clients for a user, remove that user from online list(map);
    if (userSocketIdSet.size === 0) {
      userSocketIdMap.delete(userName);
    }
  }
}

io.on('connect', async (socket) => {
  // Emiti todas as mensagens salvas ao conectar
  // const allMessages = await messagesModel.getAll();
  // socket.emit('history', allMessages);
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // socket.emit('newNickName', fakename);

  // socket.user = { nickname: faker.name.firstName() };
  const fakename = faker.name.firstName();

  addClientToMap(fakename, socket.id);

  console.log(userSocketIdMap.get(fakename));

  socket.emit('newUser', fakename);
  // socket.emit('newNickName', fakename);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Ao receber message, insere mensagem e emiti para o history novamente
  socket.on('message', async ({ nickname, chatMessage }) => {
    if (!nickname || !chatMessage) return io.emit('status', 'Digite seu nome ou mensagem');

    const messageProfile = createMessageProfile(nickname, chatMessage);
    await messagesModel.insert(messageProfile);

    const { data, hora } = messageProfile;
    const completeMessage = `${data} ${hora} ${nickname}: ${chatMessage}`;
    io.emit('message', completeMessage);
    return io.emit('status', 'Mensagem enviada');
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Ao receber 'clear', deleta todas mensagens do banco
  socket.on('clear', async () => {
    await messagesModel.deleteAll();
    socket.emit('cleared');
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
});

server.listen(PORT, () => {
  console.log(`Server na porta: ${PORT}`);
});
