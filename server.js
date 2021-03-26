const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment');

const app = express();

// require socket.io e protocolo http
const socketIo = require('socket.io');
const http = require('http');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server, {
  cors: {
    // url aceita pelo
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    // Métodos aceitos pela url
  },
});

app.use(bodyParser.json());
app.use(cors());

// require models mensagens
// const { createMessage, getMessages } = require('./models/messagesModel');

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'public')));
// por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', path.join(__dirname, 'public'));

const users = {};

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  io.emit('conectado', `${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`${socket.id} está desconectado`);
  });
});

app.get('/', async (_req, res) => {
  const allcoisa = [{ nome: 'samuel', idade: 18 }];
  res.status(200).render('index', { allcoisa, users });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`ICQ balançou a tela na porta ${PORT}, saudades!!!.`));
