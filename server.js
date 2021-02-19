const express = require('express');

const app = express();

const http = require('http');

const server = http.createServer(app);

const socketIo = require('socket.io');

const cors = require('cors');

app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

app.set('view engine', 'ejs'); // dizendo para o app que iremos usar o ejs para montar a pag

app.set('views', './views'); // onde estarão as views que serão enviadas para o usuário

app.get('/', async (_req, res) => {
  res.status(200).render('index');
});

app.get('/fut', (_req, res) => {
  res.status(200).render('test');
});

io.on('connection', (_socket) => {
  console.log('Alguém conectou');
});

server.listen(3000, () => console.log('msn na porta 3000'));
