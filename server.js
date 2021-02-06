const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);
const PORT = 3000;

const { createMessage, getAllMessages } = require('./models/messageModel');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
  const messages = await getAllMessages();

  res.render(path.join(__dirname, './views/index.ejs'), { messages });
});

io.on('connection', (socket) => {
  console.log('A user connected.');

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss A');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

httpServer.listen(PORT, () => console.log(`Rodando na porta ${PORT}...`));
