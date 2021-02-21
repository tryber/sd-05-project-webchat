const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const dateFormat = require('dateformat');

// Escopo retirado do conteúdo 32.3
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Import da model
const { createMessage, getMessages } = require('./models/message');

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.json());
app.use(cors());

// Endpoint para leitura das mensagens
app.get('/', async (req, res) => {
  const allMessages = await getMessages();
  res.status(200).render('index', { allMessages });
});

// Endpoint para envio de mensagens

// formato da data
// DD-MM-yyyy HH:mm:ss ${message.nickname} ${message.chatMessage}
io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  io.emit('conectado', `${socket.id}`);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const dateTime = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    await createMessage(nickname, chatMessage, dateTime);
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
