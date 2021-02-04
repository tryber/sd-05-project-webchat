const express = require('express');
const moment = require('moment');

const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { addMessage, getMessages } = require('./models/messages');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

// app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

let onlineUsers = [];

app.get('/', async (_, res) => {
  const messages = await getMessages();
  res.status(200).render('index', { messages, onlineUsers });
});

io.on('connection', async (socket) => {
  /*

      sockets

  */

  /*
      usuário logou
  */

  const userId = socket.id;
  console.log(`Usuário conectado! ID: ${userId}`);
  const randomNick = `User${parseInt(Math.random() * 100000, 10)}`;
  onlineUsers.unshift({ userId, nickname: randomNick });
  io.emit('userLogedIn', randomNick, userId);
  io.emit('anotherUserChangedNick', randomNick, socket.id);

  /*
      usuário deslogou
  */
  socket.on('disconnect', () => {
    console.log(`Usuário desconectado! ID: ${userId}`);
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    io.emit('quit', userId);
    socket.disconnect(0);
  });

  /*
      usuário enviou msg
  */
  socket.on('message', async ({ nickname, chatMessage }) => {
    const dateTime = new Date().getTime();
    const date = moment(dateTime).format('DD-MM-yyyy h:mm:ss A');
    await addMessage({ nickname, chatMessage, date });
    const message = `${date} - ${nickname}: ${chatMessage}`;
    console.log(message);
    io.emit('message', message);
  });

  /*
      usuário trocou nick
  */

  socket.on('nickChange', (nickname) => {
    onlineUsers = onlineUsers.map((user) => {
      if (user.userId === userId) {
        const u = user;
        u.nickname = nickname;
        return u;
      }
      return user;
    });
    io.emit('anotherUserChangedNick', nickname, userId);
  });
});

server.listen(PORT, () => console.log(`Baguncinha rolando na porta ${PORT}`));
