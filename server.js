require('dotenv').config();
const express = require('express');

const app = express();
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const moment = require('moment');
const faker = require('faker');

const messagesModel = require('./models/messagesModel');

app.use(express.json());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Arquivos estáticos dentro da pasta views
app.use(express.static(path.join(__dirname, 'views')));

let onlineUsers = [];

app.get('/', async (req, res) => {
  const historyMessage = await messagesModel.getAll();
  console.log(onlineUsers);
  res.render('index', { historyMessage, onlineUsers });
});

io.on('connection', (socket) => {
  const fake = faker.name.firstName();
  onlineUsers.push({ id: socket.id, nickname: fake });
  console.log(`${socket.id} now connected`);

  io.emit('users updated', { id: socket.id, onlineUsers });

  socket.emit('welcome', `Welcome to server, ${fake}!!`);

  socket.on('change nickname', (nickname) => {
    const userIndex = onlineUsers.findIndex((user) => user.id === socket.id);
    onlineUsers.slice(userIndex, 1);
    onlineUsers.push({ id: socket.id, nickname });
    io.emit('users updated', { id: socket.id, onlineUsers });
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id}: disconnected`);
    const updatedUsers = onlineUsers.filter((user) => user.id !== socket.id);
    onlineUsers = updatedUsers;
    io.emit('users updated', { id: socket.id, onlineUsers });
  });

  socket.on('message', async (message) => {
    const date = new Date().getTime();
    const timestamp = moment(date).format('DD-MM-yyyy hh:mm:ss');
    const post = { ...message, timestamp };

    await messagesModel.postMessage(post);
    const formattedPost = `${post.timestamp} - ${post.nickname || fake}: ${post.chatMessage}`;
    io.emit('message', formattedPost);
  });

  socket.on('error', (error) => {
    console.log('Socket error: ', error.message);
  });
});

io.on('error', (error) => {
  console.log('Server error: ', error.message);
});

http.listen(PORT, () => console.log(`The Shining is listening on ${PORT}!`));
