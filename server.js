// pair programming PR, Lari, Sid, Samuel
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moment = require('moment');

const app = express();

const socketIo = require('socket.io');
const http = require('http');
const { createMessage, getMessages } = require('./model/messages');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'view')));
// por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', path.join(__dirname, 'view'));

const onlineUsers = {};

io.on('connection', (socket) => {
  const socketId = socket.id;
  console.log(`Socket conectado: ${socketId}`);

  socket.on('newUserConectando', ({ myData }) => {
    myData.socketId = socket.id;
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
    console.log(myData, 'AQUI ESTÁ O MYDATA');
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socketId];
    io.emit('updateUsers', { onlineUsers });
    console.log(`${socketId} está desconectado`);
  });

  socket.on('message', ({ chatMessage, nickname }) => {
    const data = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    const newMessage = `${data} - ${nickname}: ${chatMessage}`;
    createMessage(newMessage);
    io.emit('message', newMessage);
  });

  socket.on('displayName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
  });

  //     // CRIAR MENSAGEM PRIVATA
  //     msg = await createPrivateMessage({
  //       nickname,
  //       message: chatMessage,
  //       timestamp: moment(new Date()).format('DD-MM-yyyy hh:mm:ss'),
  //       addressee,
  //     });

  // SALA PRIVATE

  // https://socket.io/docs/v3/rooms/
  // io.to(socketId)
  //   .to(addressee)
  //   .emit('message', `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`, 'private');
  // }
  // });
});
let numeros = 0;
app.get('/', async (_req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).render('chat', { getAllMessages, onlineUsers, numeros });
  numeros += 1;
});

const PORT = 3000;
server.listen(PORT, () => console.log('Oou vc tem uma nova conversa'));
