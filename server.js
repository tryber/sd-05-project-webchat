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

app.get('/', async (req, res) => {
  const historyMessage = await messagesModel.getAll();
  res.render('index', { historyMessage });
});

io.on('connection', (socket) => {
  console.log(`${socket.id} now connected`);
  const fake = faker.name.firstName();
  socket.emit('welcome', `Welcome to server, ${fake}!!`);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('message', async (message) => {
    const date = new Date().getTime();
    const timestamp = moment(date).format('DD-MM-yyyy hh:mm:ss');
    const post = { ...message, timestamp };

    await messagesModel.postMessage(post);
    const formattedPost = `${message.timestamp} - ${message.nickname || fake}: ${message.chatMessage}`;
    io.emit('message', formattedPost);
    // socket.broadcast.emit('message', message);
  });

  socket.on('error', (error) => {
    console.log('Socket error: ', error.message);
  });
});

io.on('error', (error) => {
  console.log('Server error: ', error.message);
});

http.listen(PORT, () => console.log(`The Shinning is listening on ${PORT}!`));
