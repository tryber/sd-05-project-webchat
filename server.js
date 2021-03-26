const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const moment = require('moment');
// const { createMessages, allMessages } = require('./model/messages');

const app = express();

const socketServer = require('http').createServer(app);
const io = require('socket.io')(socketServer);

const port = process.env.PORT || 3000;
// const users = [];

io.on('connection', (socket) => {
  console.log('usuario ta on');
  socket.on('salvar mensagens', ({ message }) => {
    console.log(message);
    io.emit('respondendo', { message });
  });
  /* socket.on('chat', async (message) => {
        const date = new Date().getTime();
        const transformDate = moment(date).format('DD-MM-yyyy h:mm:ss A');
        createMessages(message);
        socket.emit('chat', { ...message, transformDate });
    });*/
  socket.on('disconnect', () => {
    console.log('usuario off', socket.id);
  });
});

app.set('view engine', 'ejs');
app.set('views', './view');
app.use(bodyParser.json());
app.use(cors());

app.get('/', async (_req, res) => {
  // const screenMessage = await allMessages();
  res.status(200).render('chat');
});

socketServer.listen(port, () => {
  console.log('Oou vc tem uma nova conversa');
});
