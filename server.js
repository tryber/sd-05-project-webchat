const express = require('express');

require('dotenv').config();

const PORT = 3000;

const app = express();

const http = require('http');

const server = http.createServer(app);

const io = require('socket.io')(server);

let usuarios = [];

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('connected', ({ nickname }) => {
    usuarios.push({ id: socket.id, nickname });
    console.log(usuarios);
    io.emit('refreshUsers', { usuarios });
  });
  socket.on('changeNick', ({ nickname }) => {
    const indexUser = usuarios.findIndex((user) => user.id === socket.id);
    usuarios[indexUser].nickname = nickname;
    io.emit('refreshUsers', { usuarios });
  });
  socket.on('disconnect', () => {
    usuarios = usuarios.filter((user) => user.id !== socket.id);
    io.emit('refreshUsers', { usuarios });
    console.log('Alguém caiu');
  });
});

app.set('view engine', 'ejs');

app.set('views', './views');

let contador = 0;

app.get('/', (_req, res) => {
  res
    .status(200)
    .render('index', { contador: `convidado ${contador}`, usuarios });
  contador += 1;
});

server.listen(PORT, () => {
  console.log(`Oieee ${PORT}`);
});
