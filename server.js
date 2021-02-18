require('dotenv').config();
const express = require('express');
const moment = require('moment');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'views')));

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

const http = require('http').createServer(app);

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo

const client = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

// const create = require('./controllers');
const { createMessage, getAll } = require('./models/Message');
// const { createUser, getAllUsers } = require('./models/User');

// aqui está renderizando o código
// app.use('/', create);

let users = [];

app.get('/', async (_req, res) => {
  const messages = await getAll();
  // console.log('users===> ', users);
  res.render('index', { messages, users });
});

/* app.get('/', async (_req, res) => {
  const messages = await getAll();
  console.log('batatinha===>', messages);
  res.render('index', { messages, users });
}); */

// Foi criado um envento chamado connecton e a cada socket que for criado
// será renderizado para o client o id e a string connected
client.on('connection', async (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('online', async ({ nickname }) => {
    /* console.log('nickname ====> ', nickname)
    await createUser({ nickname });
    const users = await getAllUsers();
    const usersOnline = `${nickname.nickname}`;
    users.push({ id: socket.id, nickname });
    socket.broadcast.emit('updateArrayUsers', { id: socket.id, usersOnline }); */

    console.log('nickname ====> ', nickname);
    console.log(`User ${socket.id} connected`);
    users.unshift({ id: socket.id, nickname });
    client.emit('updateArrayUsers', { id: socket.id, users });
  });

  socket.on('updateName', ({ nickname }) => {
    const index = users.findIndex((user) => user.id === socket.id);
    users[index] = { id: socket.id, nickname };
    client.emit('updateArrayUsers', { id: socket.id, users });
  });

  // cada msg do client será composta pelo momento q enviou a msg, o nickname e a msg
  socket.on('message', async ({ nickname, chatMessage }) => {
    console.log('aquiii ==>', nickname, chatMessage);
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    // moment do projeto crush manager
    /* if (!moment(date.datedAt, 'DD/MM/AAAA').isValid()) {
      res.status(400).json({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });
    } */
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage(timestamp, nickname, chatMessage);
    // const newMessage = { nickname, chatMessage, timestamp };
    // toda vez que o evento message for emitido vai renderizar a msg no padrão da const message
    // vai mandar para todo mundo de menos para quem enviou
    // client.broadcast.emit('newMessage', newMessage );
    socket.broadcast.emit('message', message);
    // console.log('message ====>', message);
  });
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect`);
    const disconnectUser = users.filter((user) => user.id !== socket.id);
    users = disconnectUser;
    client.emit('updateArrayUsers', { id: socket.id, users });
  });
});

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
