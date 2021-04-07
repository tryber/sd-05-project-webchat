const express = require('express');

require('dotenv').config();

const dateformat = require('dateformat');

const PORT = 3000;

const app = express();

const http = require('http');

const server = http.createServer(app);

const io = require('socket.io')(server);

const model = require('./models/mensagem');

let usuarios = [];

io.on('connection', (socket) => {
  socket.on('connected', ({ nickname }) => {
    usuarios.push({ id: socket.id, nickname });
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
  socket.on('message', async ({ nickname, target, chatMessage }) => {
    const agora = dateformat(new Date(), 'dd-mm-yyyy hh:MM:ss');
    if (!target) {
      const newMessage = `${agora} - ${nickname}: ${chatMessage}`;
      await model.createMessage(newMessage);
      io.emit('message', newMessage);
    } else {
      const newMessage = `${agora} (private) - ${nickname}: ${chatMessage}`;
      await model.createPrivateMessage(newMessage, target, socket.id);
      io.to(target).to(socket.id).emit('message', newMessage);
    }
  });
  socket.on('private', async ({ target }) => {
    const historico = await model.getPrivate(target, socket.id);
    io.to(target).to(socket.id).emit('historico', historico);
  });
  socket.on('public', async () => {
    const historico = await model.getAll();
    io.to(socket.id).emit('historico', historico);
  });
});

app.set('view engine', 'ejs');

app.set('views', './views');

let contador = 0;

app.get('/', async (req, res) => {
  const allMessages = await model.getAll();
  res.status(200).render('index', {
    contador: `convidado ${contador}`,
    usuarios,
    allMessages,
  });
  contador += 1;
});

server.listen(PORT, () => {
  console.log(`Oieee ${PORT}`);
});
