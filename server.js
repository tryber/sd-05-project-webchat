require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'public'));
app.set('views', './public');

app.set('view engine', 'ejs');

const messagesModels = require('./models/messagesModel');

app.get('/', async (req, res) => {
  const history = await messagesModels.messagesHistory();
  return res.render('index.ejs', { history });
});

io.on('connection', async (socket) => {
  console.log(`Socket ${socket.id} conectado`);
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} desconectado`);
  });

  socket.on('message', async (message) => {
    console.log(message);
    const stored = await messagesModels.newMessage(message.nickname, message.chatMessage);
    const text = `${stored.time} - ${stored.nickname}: ${stored.chatMessage}`;
    console.log(text);
    io.emit('message', text);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`O pai ta na porta ${port}`);
});
