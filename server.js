require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const moment = require('moment');

// Conteúdo dia 32.3 - https://app.betrybe.com/course/back-end/nodejs/socketio/conteudo/show-me-the-code?use_case=side_bar
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { createMessage, getAllMessages } = require('./models/chatModel');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));
// informing express to use static file inside specified directory
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (_req, res) => {
  const allMessages = await getAllMessages();
  res.render('chat', { allMessages });
});

app.post('/message', (req, res) => {
  const { chatMessage, nickname } = req.body;

  if (!chatMessage || !nickname) {
    return res.status(422).json({ message: 'Missing information' });
  }

  // Evento personalizado que dispara para todos os clients.
  // primeiro parametro, nome do evento, segundo, ação que o client deve fazer/dados enviados.
  io.emit('message', { chatMessage, nickname });

  res.status(200).json({ message: `${nickname} enviou: ${chatMessage}` });
});

// Servidor express
// app.listen(3000, () => {
//   console.log('app on 3000')
// })

io.on('connection', (socket) => {
  const userId = socket.id;
  console.log(`${userId} conectou`);

  socket.on('usuarioAlterouNickname', (nickname) => {
    console.log('Alguem mudou nickname para', nickname);

    console.log(socket);
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const formatedDate = moment(new Date().getTime()).format('DD-MM-yyyy HH:mm:ss');
    await createMessage({
      dateFormat: formatedDate,
      nickname,
      chatMessage,
    });

    io.emit('message', `${formatedDate} - ${nickname}:  ${chatMessage}`);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} desconectou`);
  });
});

// Servidor Socket (e express no mesmo servidor)
http.listen(PORT, () => {
  console.log(`Servidores ouvindo na porta ${PORT}`);
});
