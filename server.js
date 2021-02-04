// const client = require('socket.io').listen(4000).sockets;
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const express = require('express');
const faker = require('faker');
const messagesModel = require('./models/messagesModel');
const createMessageProfile = require('./tests/helpers/createMessageProfile');
const {
  userSocketIdMap,
  addClientToMap,
  removeClientFromMap,
} = require('./tests/helpers/userSocketIDMap');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

app.use(express.urlencoded());
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

io.on('connect', async (socket) => {
  // Emiti todas as mensagens salvas ao conectar
  // const allMessages = await messagesModel.getAll();
  // socket.emit('history', allMessages);
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // socket.emit('newNickName', fakename);

  // socket.user = { nickname: faker.name.firstName() };
  const fakename = faker.name.firstName();
  console.log(socket.id)

  const clientID = socket.id;

  addClientToMap(fakename, clientID);

  console.log(userSocketIdMap);

  socket.emit('newUser', { fakename, clientID });
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
    userSocketIdMap.clear();
    console.log('clear', userSocketIdMap);
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
});

server.listen(PORT, () => {
  console.log(`Server na porta: ${PORT}`);
});
