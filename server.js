require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const faker = require('faker');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { postMessage, getMessage } = require('./models/message');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');
app.use(bodyParser.json());

let usersOnline = [];

app.use('/', async (req, res) => {
  const msgHistory = await getMessage();
  res.render('index', { msgHistory, usersOnline });
});

io.on('connection', (socket) => {
  let user = {
    id: socket.id,
    nickname: faker.name.firstName(),
  };
  console.log(`Socket conectado: ${socket.id}`);
  socket.emit('connected', user);
  socket.broadcast.emit('notify', user);
  usersOnline.push(user);

  socket.on('message', async ({ chatMessage, nickname }) => {
    console.log(chatMessage, nickname);
    const dateTime = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    await postMessage(chatMessage, dateTime, nickname);
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });

  socket.on('author', async (nickname) => {
    usersOnline = usersOnline.filter((users) => users.id !== user.id);
    user = { nickname, id: socket.id };
    usersOnline.push(user);
    io.emit('author', user);
  });

  socket.on('disconnect', () => {
    usersOnline = usersOnline.filter((users) => users.id !== user.id);
    io.emit('disconnected', user.id);
  });
});

server.listen(3000, () => console.log('Processando na porta 3000'));
