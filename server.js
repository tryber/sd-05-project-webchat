const express = require('express');

const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const path = require('path');
const moment = require('moment');
const io = require('socket.io')(server);

const { insert, getAll } = require('./model/messageModel');

const formatDate = 'DD-MM-yyyy HH:mm:ss';
let onlineUsers = [];

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));
app.get('/', async (req, res) => {
  const messages = await getAll();
  const formatedMessages = messages.map(
    (mensagem) =>
      `${mensagem.time} - ${mensagem.nickname}: ${mensagem.chatMessage}`,
  );
  res.render('index', { formatedMessages, onlineUsers });
});

io.on('connection', (socket) => {
  console.log('socket connected...');
  const usuarioNickname = `Usuario ${Math.ceil(Math.random() * 1000)}`;
  const usuarioID = socket.id;

  onlineUsers.push({ id: usuarioID, nickname: usuarioNickname });

  socket.emit('usuario', usuarioID, usuarioNickname);
  io.emit('connection', usuarioID, usuarioNickname);
  socket.on('message', async ({ chatMessage, nickname }) => {
    const momentoAtual = moment(Date.now()).format(formatDate);
    const mensagemObj = {
      chatMessage,
      time: momentoAtual,
      nickname,
    };
    await insert(mensagemObj);
    const msgFormatada = `${momentoAtual} - ${nickname}: ${chatMessage}`;
    io.emit('message', msgFormatada);
  });

  socket.on('nickChange', (nickname, id) => {
    onlineUsers = onlineUsers.filter((user) => user.id !== id);
    onlineUsers.push({ id, nickname });
    socket.broadcast.emit('nickChange', { id, nickname });
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.id !== usuarioID);
    io.emit('userDisconnect', usuarioID);
  });
});

server.listen(3000, () => console.log('Ouvindo na porta 3000'));
