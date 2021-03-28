const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const path = require('path');
const cors = require('cors');
const moment = require('moment');
const faker = require('faker');
const { saveMessages } = require('./model/webChatModel');

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.json());

let usersOnLine = [];

// aqui envio pro ejs mandando os usuários e o chat
app.get('/', (_req, res) => {
  const nickName = faker.name.findName();
  // const allMessages = await getMessages();
  res.status(200).render('index', { nickName, usersOnLine });
});

io.on('connection', (socket) => {
  console.log('Made socket connection', socket.id);

  let userId = socket.id;
  let nickName;

  socket.on('connected', (nick) => {
    userId = socket.id;
    nickName = nick;
    const user = { userId, nickName };
    usersOnLine.push(user);
    console.log(usersOnLine);
  });

  io.emit('userConnected', userId, nickName); // send to all users that are connected

  socket.on('saveNickName', (nick) => {
    const id = socket.id;
    usersOnLine = usersOnLine.filter((user) => user.userId !== id);
    usersOnLine.push({ userId: id, nickName: nick });
    console.log('Line 51 - usersOnLine:', usersOnLine);
  });

  //   socket.emit('usersOnline', usersOnLine);

  //   // socket.emit('privateChat', nickName);

  //   // Handle chat event
  //   socket.on('message', async (data) => {
  //     console.log(data);
  //     const { chatMessage, nickname } = data;
  //     const realTime = moment(new Date()).format('DD MM YYYY hh:mm:ss');
  //     const msgFormated = `${realTime} - ${nickname}: ${chatMessage}`;
  //     console.log('server L28', msgFormated);
  //     await saveMessages({ realTime, nickname, chatMessage });
  //     io.emit('message', msgFormated); // vou enviar para renderizar na página
  //   });

  //   // Handle typing event
  //   // socket.on('typing', function (data) {
  //   //   socket.broadcast.emit('typing', data);
  //   // });

  socket.on('disconnect', () => {
    usersOnLine = usersOnLine.filter((user) => user.userId !== socket.id);
  });
});

server.listen(3000, () => console.log('Listening on port 3000'));
