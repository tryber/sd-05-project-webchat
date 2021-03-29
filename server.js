const express = require('express');

const app = express();

const http = require('http');

const server = http.createServer(app);

const socketIo = require('socket.io');

const cors = require('cors');

const dateFormat = require('dateformat');

const messageModel = require('./model/message');

app.use(cors());

const io = socketIo(server, {
  // cors: {
  //   origin: 'http://localhost:3000', // url aceita pelo cors
  //   methods: ['GET', 'POST'], // Métodos aceitos pela url
  // },
});

app.set('view engine', 'ejs'); // dizendo para o app que iremos usar o ejs para montar a pag

app.set('views', './views'); // onde estarão as views que serão enviadas para o usuário

let contador = 0;

let users = [];

app.get('/', async (_req, res) => { // ejs
  const allMessages = await messageModel.getAll();
  res.status(200).render('index', { contador: `Convidado ${contador}`, users, allMessages });
  contador += 1;
});

io.on('connection', (socket) => {
  console.log('Alguém conectou');
  socket.on('connected', ({ nickname }) => {
    users.push({ id: socket.id, nickname });
    console.log(users);
    io.emit('updateUsers', { users });
  });

  socket.on('nickChange', ({ nickname }) => {
    const userIndex = users.findIndex((user) => user.id === socket.id);
    users[userIndex].nickname = nickname;
    io.emit('updateUsers', { users }); // envia para tds usuarios
  });

  socket.on('disconnect', () => {
    console.log('Alguém desconectou');
    users = users.filter((user) => user.id !== socket.id);
    io.emit('updateUsers', { users });
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const agora = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss');
    const newMessage = `${agora} - ${nickname}: ${chatMessage}`;
    await messageModel.createMessage(newMessage);
    io.emit('message', newMessage);
    // socket.broadcast.emit('RESPOSTA', 'BLOQUEADO'+num)
    // socket.emit responde apenas para ele mesmo
    // io.emit responde para todos os sockets
    // socket.broadcast.emit responde para todos os sockets menos ele mesmo
  });
});

server.listen(3000, () => console.log('msn na porta 3000'));
