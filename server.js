const moment = require('moment');
const app = require('express');
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { addMessage } = require('./models/Messages');

app.use(cors());

io.on('connection', (socket) => {
  console.log(`Usuário entrou no chat: ID ${socket.id}`);

  // Requisito 1
  socket.on('message', async ({ nickname, chatMessage }) => {
    const date = moment(new Date().getTime()).format('DD-MM-YYYY hh:mm:ss A');
    addMessage({ nickname, chatMessage, date });
    const msg = `${date} - ${nickname}: ${chatMessage}`;
    io.emit('message', msg);
  });
});

http.listen(process.env.PORT || 3000);
