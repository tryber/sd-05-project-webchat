const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const httpServer = http.createServer(app);

require('dotenv').config();

const io = socketIo(httpServer);

const messagesModels = require('./models/messagesModel');
const usersModel = require('./models/usersModel');
const controllers = require('./controllers');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', './views');

const viewsUrl = path.join(__dirname, '/views');
app.use(express.static(viewsUrl));

app.get('/', controllers.chatController.getAll);

io.on('connection', async (socket) => {
  socket.on('dateUser', async (dateUser) => {
    try {
      await usersModel.add(dateUser.id, dateUser.nickname);
      socket.emit('newUser', dateUser);
      socket.broadcast.emit('newUser', dateUser);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('dataUserEdit', async (dataUser) => {
    await usersModel.update(dataUser.id, dataUser.nickname);
    socket.emit('dataUserEdited', dataUser);
    socket.broadcast.emit('dataUserEdited', dataUser);
  });

  socket.on('disconnect', async () => {
    const userId = socket.id;
    socket.emit('userDisconnect', userId);
    socket.broadcast.emit('userDisconnect', userId);
    await usersModel.exclude(userId);
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
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));
