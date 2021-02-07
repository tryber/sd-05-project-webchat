const express = require('express');
const path = require('path');
const moment = require('moment');

const PORT = process.env.PORT || 3000;

const app = express();

const http = require('http');

const httpServer = http.createServer(app);

const cors = require('cors');

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

const messageController = require('./controllers/messageController');
const { createMessage } = require('./models/MessageModel');

app.use('/', messageController);

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('nickname', async (nickname) => {
    console.log(nickname);
    socket.emit('nickname', nickname);
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date().getTime()).format('DD-MM-yyyy hh:mm:ss');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect`);
  });
});

httpServer.listen(PORT, () => console.log('rodando na porta 3000'));
