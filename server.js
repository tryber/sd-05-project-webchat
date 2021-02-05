require('dotenv').config();
const express = require('express');
const app = express();
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const moment = require('moment');

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
  socket.emit('welcome', `Welcome to server!`);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('message', async (message) => {
    // console.log(message);
    const date = new Date().getTime();
    const timestamp = moment(date).format('DD-MM-yyyy hh:mm:ss');
    message = {...message, timestamp};
    // console.log(message);
    await messagesModel.postMessage(message);
    // socket.broadcast.emit('message', message);
    message = `${message.timestamp} - ${message.nickname}: ${message.chatMessage}`
    io.emit('message', message);
  });

  socket.on('error', (error) => {
    console.log('Socket error: ', error.message);
  });
});

io.on('error', (error) => {
  console.log('Server error: ', error.message);
});

http.listen(PORT, () => console.log(`The Shinning is listening on ${PORT}!`));
