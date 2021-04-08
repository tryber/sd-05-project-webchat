const express = require('express');
const moment = require('moment');

const app = express();

// set the template engine ejs
app.set('view engine', 'ejs');

// middlewares
app.use(express.static('middleWares'));

// Listen on port 3000
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Rodando esta mierda em ${port}`);
});

// socket.io instantiation
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

// controllers
const { getMessages, createMessage, getPrivateMessages } = require('./models/messages');

// User Array
let numeros = 0;
const usersOnline = {};

// listen on every connection
io.on('connection', (socket) => {
  // on connect
  io.emit('conectado', `${socket.id}`);

  // message logs
  const chatHistory = getMessages();
  socket.emit('message_history', chatHistory);

  // on login
  socket.on('userData', ({ userData }) => {
    usersOnline[socket.id] = { ...userData, socketId: socket.id };
    io.emit('updateUser', { usersOnline });
  });

  // listen on change_username
  socket.on('change_username', ({ userData }) => {
    usersOnline[userData.socketId] = userData;
    io.emit('updateUser', { usersOnline });
  });

  // listen on new_message
  socket.on('message', async ({ chatMessage, nickname, alvo = '' }) => {
    const date = moment(new Date()).format('DD-MM-yyyy HH:mm:ss');
    let newMessage;
    console.log('socorro', alvo);
    if (!alvo) {
      newMessage = `${date} - ${nickname}: ${chatMessage}`;
      // emit the new message
      await createMessage(newMessage, alvo, socket.id);
      io.emit('message', newMessage);
    } else {
      newMessage = `${date} (private) - ${nickname}: ${chatMessage}`;
      // emit the private message
      await createMessage(newMessage, alvo, socket.id);
      io.to(socket.id).to(alvo).emit('message', newMessage);
    }
  });

  // on prvt
  socket.on('private_message', async (alvo) => {
    const chatlog = await getPrivateMessages(alvo, socket.id);
    console.log(chatlog);
    io.to(alvo).to(socket.id).emit('chat-log', chatlog);
  });

  socket.on('public_message', async () => {
    const chatlog = await getMessages();
    console.log(chatlog);
    io.to(socket.id).emit('chat-log', chatlog);
  });
  // // listen on typing
  // socket.on('typing', (data) => {
  //   socket.broadcast.emit('typing', { username: socket.username });
  // });

  // listen on disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    delete usersOnline[socket.id];
    io.emit('updateUser', { usersOnline });
  });
});

// routes
// getting Render from views folder 'chat.ejs'
app.get('/', async (_req, res) => {
  const getMsgs = await getMessages();
  console.log(getMsgs);
  res.status(200).render('chat', { getMsgs, usersOnline, numeros });
  numeros += 1;
});
