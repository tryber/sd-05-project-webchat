const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const moment = require('moment');

const { createMessage, createPrivateMessage, getMessages } = require('./models/Messages');

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cors());

app.use('/', express.static(path.join(__dirname, 'public')));

const onlineUsers = {};

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

  socket.on('message', async ({ nickname, chatMessage, receiver }) => {
    let msg;
    if (!receiver) {
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
        receiver,
      });
      io.to(socket.id)
        .to(receiver)
        .emit('message', `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`, 'private');
    }
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
