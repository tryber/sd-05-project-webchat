const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const httpServer = http.createServer(app);

require('dotenv').config();

const io = socketIo(httpServer);

const messagesModels = require('./models/messagesModel');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static(path.join(__dirname, 'views')));

let listNamesConverted = [];

io.on('connection', async (socket) => {
  socket.on('dateUser', (dateUser) => {
    listNamesConverted = [...listNamesConverted, dateUser];
    socket.emit('listNamesConverted', listNamesConverted);
    socket.broadcast.emit('listNamesConverted', listNamesConverted);
  });

  socket.on('dataUserEdit', (dataUserEdit) => {
    listNamesConverted.forEach((user, index) => {
      if (user.id === dataUserEdit.id) {
        listNamesConverted.splice(index, 1, dataUserEdit);
      }
    });
    socket.emit('listNamesConverted', listNamesConverted);
    socket.broadcast.emit('listNamesConverted', listNamesConverted);
  });

  socket.on('disconnect', () => {
    listNamesConverted = listNamesConverted.filter((user) => user.id !== socket.id);
    socket.broadcast.emit('listNamesConverted', listNamesConverted);
  });

  let message;
  socket.on('message', async (data) => {
    try {
      const addMessage = await messagesModels.add(data.nickname, data.chatMessage);
      if (data.idPrivateRecipient) {
        message = `${addMessage.dateMessage} (private) - ${addMessage.nickname}: ${addMessage.chatMessage}`;
        socket.to(data.idPrivateRecipient).emit('dataServerPrivate', message);
        socket.emit('message', message);
      } else {
        message = `${addMessage.dateMessage} - ${addMessage.nickname}: ${addMessage.chatMessage}`;
        socket.emit('message', message);
        socket.broadcast.emit('message', message);
      }
    } catch (e) {
      console.log(e.message);
    }
  });
  try {
    const messages = await messagesModels.getAll();
    messages.forEach((item) => {
      message = `${item.dateMessage} - ${item.nickname}: ${item.chatMessage}`;
      socket.emit('message', message);
    });
  } catch (e) {
    console.log(e.message);
  }
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));
