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

const cors = require('cors');

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo

const client = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

const create = require('./controllers/messageController');
const { createMessage } = require('./models/Message');

app.use('/', create);

// Foi criado um envento chamado connecton e a cada socket que for criado
// será renderizado para o client o id e a string connected
client.on('connection', async (socket) => {
  console.log(`${socket.id} connected`);

  // cada msg do client será composta pelo momento q enviou a msg, o nickname e a msg
  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    // moment do projeto crush manager
    /* if (!moment(date.datedAt, 'DD/MM/AAAA').isValid()) {
      res.status(400).json({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });
    } */
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });

    // toda vez que o evento message for emitido vai renderizar a msg no padrão da const message
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect`);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
