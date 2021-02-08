const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
// https://www.npmjs.com/package/dateformat, um oferecimento de Paulo D'Andrea

const msgModel = require('./models/messages');
const userModel = require('./models/users');
const controller = require('./controllers/controller');

// const io = require('socket.io')(http, {
//   cors: {
//     origin: 'http://localhost:3000', // url aceita pelo cors
//     methods: ['GET', 'POST'], // Métodos aceitos pela url
//   }
// });

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');

app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));

app.get('/', controller.listMessagesAndUsers);

io.on('connection', async (socket) => {
  const ID = `Usuário ${Date.now()}`;
  console.log(`${ID} has connected`);
  // socket.broadcast.emit('onlineUsers', ID);
  socket.emit('nickname', ID);
  socket.broadcast.emit('onlineUsers', ID, ID);
  await userModel.create({ id: ID, nickname: ID }); // precisa controller?

  socket.on('message', async ({ nickname, chatMessage }) => {
    if (!nickname || !chatMessage) {
      return socket.emit('status', 'Dados inválidos');
    }
    // const time = new Date().toUTCString();
    const now = new Date();
    const date = dateFormat(now, 'dd-mm-yyyy');
    const time = dateFormat(now, 'HH:mm:ss');

    console.log(`Mensagem ${time} ${nickname} ${chatMessage}`);
    await msgModel.create({ date, time, nickname, chatMessage }); // precisa controller?
    socket.emit('message', (`${date} ${time} - ${nickname}: ${chatMessage}`));
    socket.broadcast.emit('message', (`${date} ${time} - ${nickname}: ${chatMessage}`));
    return socket.emit('status', 'mensagem enviada');
  });

  socket.on('nicknamechange', async (userName) => {
    socket.broadcast.emit('newNickname', ID, userName);
    await userModel.updateUser(ID, userName);
  });

  socket.on('disconnect', async () => {
    console.log(`${socket.id} disconnected`);
    socket.broadcast.emit('disconnectedUser', ID);
    await userModel.excludeUser(ID);
  });
});

server.listen(3000, () => {
  console.log('server listening at 3000');
});
