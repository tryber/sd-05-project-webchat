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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

io.on('connection', (socket) => {
  console.log(`${socket.nickname} connected.`);

  socket.on('message', ({ nickname, chatMessage }) => {
    const dateAndTimeNow = moment(new Date()).format('DD-MM-yyyy hh:mm:ss A');
    const message = `${dateAndTimeNow} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.nickname} disconnected.`);
  });
});

httpServer.listen(PORT, () => console.log(`Rodando na porta ${PORT}...`));
