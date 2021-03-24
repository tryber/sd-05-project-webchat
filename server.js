// Desenvovimento com Samuel #32
const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment');
// require models mensagens
const { createMessage, createPrivateMessage, getMessages } = require('./model/messagesModel');
const controller = require('./controller/messagesController')

const app = express();

// require socket.io e protocolo http
const http = require('http');
const socketIo = require('socket.io');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server);



app.use(express.json());
app.use(cors());
app.use('/', controller);

// rota app.use do diretorio public
// app.use('/', express.static(path.join(__dirname, 'public')));
// // por default view engine é ejs
app.set('view engine', 'ejs');
app.set('views', './public');

const onlineUsers = {};

// concectando socket
io.on('connection', async (socket) => {
  const messages = await getMessages();
  io.to(socket.id).emit('displayHistory', messages, 'public');

  socket.on('userConnection', (currentUser) => {
    onlineUsers[socket.id] = currentUser;
    io.emit('displayUsers', onlineUsers);
  });

  socket.on('updateNick', (nickname) => {
    onlineUsers[socket.id] = nickname;
    io.emit('displayUsers', onlineUsers);
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
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
      io.to(socket.id)
        .to(addressee)
        .emit('message', `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`, 'private');
    }
  });
});

server.listen(3000, () => console.log('Listening on port 3000...'));
