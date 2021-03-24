// Back-end server side

// DEPENDENCIES

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
require('dotenv').config();

// IMPORTATIONS

const app = express();
app.use(bodyParser.json());

// SET IO & CORS

const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

const Messages = require('./models/Messages');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(cors());

const onlineUsers = {};

io.on('connection', async (socket) => {
  console.log('user connected');
  const messages = await Messages.getMessages();
  io.to(socket.id).emit('showMessageHistory', messages, 'public');

  socket.on('userConection', (currentUser) => {
    onlineUsers[socket.id] = currentUser;
    io.emit('showOnlineUsers', onlineUsers);
  });
  socket.on('changeNickname', (nickname) => {
    onlineUsers[socket.id] = nickname;
    io.emit('showOnlineUsers', onlineUsers);
  });

  socket.on('message', async ({ nickname, chatMessage, receiver }) => {
    let msg = {
      nickname,
      message: chatMessage,
      timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
    };
    if (!receiver) {
      const message = await Messages.newMessage(msg);
      io.emit('message', `${message.timestamp} - ${message.nickname}: ${message.message}`, 'public');
    } else {
      msg = { ...msg, receiver };
      io.to(socket.id)
        .to(receiver)
        .emit('message', `${msg.timestamp} (private) - ${msg.nickname}: ${msg.message}`, 'private');
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete onlineUsers[socket.id];
    io.emit('showOnlineUsers', onlineUsers);
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
