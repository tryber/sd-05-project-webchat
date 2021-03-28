const express = require('express');

require('dotenv').config();

const PORT = 3000;

const app = express();

const http = require('http');

const server = http.createServer(app);

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('teste', (ui) => {
    console.log(ui);
  });
});

app.set('view engine', 'ejs');

app.set('views', './views');

let contador = 0;

app.get('/', (_req, res) => {
  res.status(200).render('index', { contador });
  contador += 1;
});

server.listen(PORT, () => {
  console.log(`Oieee ${PORT}`);
});
