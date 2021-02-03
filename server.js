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

const PORT = 5000;

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
  const allMessages = await messagesModel.getAll();

  res.render('index', { allMessages });
});

app.use('/', express.static(path.join(__dirname, './views')));

io.on('connect', async (socket) => {
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const fakename = faker.name.firstName();
  socket.emit('newNickName', fakename);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Emiti todas as mensagens salvas ao conectar
  // const allMessages = await messagesModel.getAll();
  // socket.emit('history', allMessages);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Ao receber message, insere mensagem e emiti para o history novamente
  socket.on('message', async ({ nickname, chatMessage }) => {
    if (!nickname || !chatMessage) return io.emit('status', 'Digite seu nome ou mensagem');

    const messageProfile = createMessageProfile(nickname, chatMessage);
    await messagesModel.insert(messageProfile);
    io.emit('message', messageProfile);
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
