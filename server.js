const moment = require('moment');
const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { addMessage } = require('./models/messages.model');

app.use(cors());

io.on('connection', (socket) => {
  console.log('Usuário entrou no chat!');
  socket.on('message', async ({ nickname, chatMessage }) => {
    const msgDateTime = moment(new Date().getTime()).format('DD-MM-YYYY hh:mm:ss A');
    const msg = `${msgDateTime} - ${nickname}: ${chatMessage}`;
    addMessage(msg);
    io.emit('message', msg);
  });
});

http.listen(process.env.PORT || 3000);
