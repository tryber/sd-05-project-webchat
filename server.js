const express = require('express');
const moment = require('moment');

const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { addMessage } = require('./models/messages');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.use('/', (_, res) => {
  res.render('index.html');
});

server.listen(PORT, () => console.log(`Baguncinha rolando na porta ${PORT}`));

io.on('connection', async (socket) => {
  console.log(`Usuário conectado! ID: ${socket.id}`);

  socket.emit('logedIn', socket.id);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const dateTime = new Date().getTime();
    const date = moment(dateTime).format('DD-MM-yyyy h:mm:ss A');
    await addMessage({ nickname, chatMessage, date });
    const message = `${date} - ${nickname}: ${chatMessage}`;
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado! ID: ${socket.id}`);
  });
});
