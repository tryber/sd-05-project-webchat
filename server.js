const express = require('express');
const http = require('http');
const app = express();
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);
// const net = require('net');
// const cors = require('cors');
const path = require('path');
// const moment = require('moment');
// const { io } = require('socket.io-client');

app.use('/', express.static(path.join(__dirname, 'view')));

app.set('view engine', 'ejs');
app.set('views', './view');
let numeros = 0;
app.get('/', async (_req, res) => {
  res.status(200).render('view', { numeros });
  numeros++
});

io.on('connection', (socket) => {
  console.log('Chegou o visitante ', socket.id);
  socket.on('disconnect', () => {
    console.log('Visitante', socket.id, ' desconectou');
  });
  socket.on('message', ({ chat }) => {
    io.emit('updateMessage', { chat });
  });
});

const PORT = 3000;
httpServer.listen(PORT, () =>
  console.log(`chatinho do bol rolando na ${PORT}`),
);
