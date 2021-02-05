// const client = require('socket.io').listen(4000).sockets;
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const express = require('express');
const faker = require('faker');
const messagesModel = require('./models/messagesModel');
const createMessageProfile = require('./tests/helpers/createMessageProfile');
const {
  userSocketIdMap,
  addClientToMap,
  removeClientFromMap,
} = require('./tests/helpers/userSocketIDMap');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

// app.use(express.urlencoded());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));

// const fakename = faker.name.firstName();

app.get('/', async (req, res) => {
  const allMessages = await messagesModel.getAll();

  const usersMap = Array.from(userSocketIdMap, ([name, id]) => ({ name, id }));

  res.render('index', { allMessages, onlineUsers: usersMap });
});

io.on('connect', async (socket) => {
  let fakename = faker.name.firstName();
  const clientID = socket.id;
  addClientToMap(fakename, clientID);
  const usersMap = Array.from(userSocketIdMap, ([name, id]) => ({ name, id }));

  socket.emit('newUser', { fakename, usersMap });

  // ++++++

  socket.on('disconnect', () => {
    removeClientFromMap(fakename, clientID);
    io.emit('userLeft', { fakename, clientID });
    io.emit('status', `${fakename} left the chat.`);
  });

  // ++++++

  socket.on('message', async ({ nickname, chatMessage }) => {
    if (!nickname || !chatMessage) {
      return socket.emit('status', 'Digite seu nome ou mensagem');
    }

    const messageProfile = createMessageProfile(nickname, chatMessage);
    await messagesModel.insert(messageProfile);

    const { data, hora } = messageProfile;
    const completeMessage = `${data} ${hora} ${nickname}: ${chatMessage}`;
    io.emit('message', completeMessage);
    return socket.emit('status', 'Mensagem enviada');
  });

  // ++++

  socket.on('changeNick', (newNick) => {
    removeClientFromMap(fakename, clientID);
    addClientToMap(newNick, clientID);

    const usersMap2 = Array.from(userSocketIdMap, ([name, id]) => ({
      name,
      id,
    }));

    socket.emit('newUser', { fakename: newNick, usersMap: usersMap2 });

    io.emit('atualizaUsers', { usersMap2, oldNameToDelete: fakename });
    fakename = newNick;
  });

  socket.on('clear', async () => {
    await messagesModel.deleteAll();
    io.emit('cleared');
    userSocketIdMap.clear();
  });

  // Teoricamente nao precisa do abaixo
  socket.on('newUserArrived', (userThatArrived) => {
    io.emit('putNewUserOnYourList', userThatArrived);
  });
});

server.listen(PORT, () => {
  console.log(`Server na porta: ${PORT}`);
});
