require('dotenv').config();
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const client = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');

const { createMessage, getAllMessages } = require('./models/messageModel');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./'));

let users = [];

app.get('/', async (_req, res) => {
  const messages = await getAllMessages();

  res.render('index', { messages, users });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

client.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(`User (${socket.id}) has disconnected.`);
    const filterUsers = users.filter((user) => user.id !== socket.id);
    users = filterUsers;

    client.emit('updateUsers', { id: socket.id, users });
  });

  socket.on('userLogin', ({ nickname }) => {
    console.log(`User (${socket.id}) has connected...`);
    users.unshift({ id: socket.id, nickname });

    client.emit('updateUsers', { id: socket.id, users });
  });

  socket.on('updateNickname', ({ nickname }) => {
    const userIndex = users.findIndex((user) => user.id === socket.id);
    users[userIndex] = { id: socket.id, nickname };

    client.emit('updateUsers', { id: socket.id, users });
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage(nickname, chatMessage, timestamp);

    client.emit('message', message);
  });
});
