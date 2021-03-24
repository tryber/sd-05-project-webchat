const express = require('express');
const moment = require('moment');

const path = require('path');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { getMessages, addMessage } = require('./models/Messages');

app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

let onlineUsers = [];

app.get('/', async (req, res) => {
  const messages = await getMessages();
  res.status(200).render('index.ejs', { messages, onlineUsers });
});

io.on('connection', async (socket) => {
  const userId = socket.id;
  const clientNickname = `Guest_${parseInt(Math.random() * 10000, 10)}`;

  console.log(`Usuário ID: ${socket.id} entrou no chat!`);
  onlineUsers.unshift({ userId, nickname: clientNickname });

  socket.emit('connected', userId, clientNickname);
  io.emit('userConnected', userId, clientNickname);

  socket.on('message', async ({ nickname, chatMessage, to = null, from = userId }) => {
    const dateTime = new Date().getTime();
    const date = moment(dateTime).format('DD-MM-yyyy h:mm:ss A');

    await addMessage({ nickname, chatMessage, date, to, from });
    const msg = `${date} - ${nickname}: ${chatMessage}`;
    io.emit('message', msg);
  });

  socket.on('changeNickname', (nick, id) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ userId: id, nickname: nick });
    io.emit('changeNickname', nick, id);
  });

  socket.on('getMsgHistory', async () => {
    const history = await getMessages();
    socket.emit('history', history);
  });

  socket.on('getchatPrivadoHistorico', async (id, target) => {
    const history = await getMessages();
    const chatPrivadoHistorico = history.reduce((array, msg) => {
      if (msg.to && (msg.to === target || msg.from === target)) array.push(msg);
      return array;
    }, []);
    socket.emit('chatPrivadoHistorico', chatPrivadoHistorico);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado! ID: ${userId}`);
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    io.emit('userDisconectado', userId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
