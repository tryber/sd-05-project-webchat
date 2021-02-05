require('dotenv').config();
const express = require('express');
const path = require('path');

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

// https://www.youtube.com/watch?v=-jXfKDYJJvo
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

let users = [];

app.get('/', async (_req, res) => {
  const messages = await getAllMessages();

  res.render('index', { messages, users });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

client.on('connection', async (socket) => {
  console.log(`User (${socket.id}) has connected...`);

  socket.on('userLogin', async ({ nickname }) => {
    await createUser({ nickname });
    const users = await getAllUsers();
    const onlineUsers = `${nickname.nickname}`;
    users.push({ id: socket.id, nickname });

    socket.broadcast.emit('updateUsers', { id: socket.id, onlineUsers });
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });

    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`User (${socket.id}) has disconnected.`);
  });
});
