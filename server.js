const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const path = require('path');

const moment = require('moment');

const app = express();

const socketIo = require('socket.io');

const http = require('http');

const server = http.createServer(app);

const io = socketIo(server);

const PORT = process.env.PORT || 3000;

const { createMessage, getAll } = require('./models/Message');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
  const messages = await getAll();

  res.render(path.join(__dirname, './views/index.ejs'), { messages });
});

io.on('connection', (socket) => {
  console.log('User connected.');

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss A');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected.');
  });
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}.`));
