const cors = require('cors');
const moment = require('moment');
const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require('unique-names-generator');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { addMessage, allMessages } = require('./models/messages.model');

const onlineUsers = [];

app.use(cors());

app.set('view engine', 'ejs');

app.get('/', async (_, res) => {
  const messages = await allMessages();
  res.status(200).render(`${__dirname}/index`, { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const tempNick = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: 'capital',
    separator: '',
  });

  console.log(
    `Usuário ID ${userId} com o nick provisório ${tempNick} entrou no chat!`,
  );
  onlineUsers.unshift({ userId, nickname: tempNick });
  socket.emit('connected', userId, tempNick);
  io.emit('userConnected', userId, tempNick);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const date = moment(new Date().getTime()).format('DD-MM-YYYY hh:mm:ss A');
    addMessage({ nickname, chatMessage, date });
    const msg = `${date} - ${nickname}: ${chatMessage}`;
    io.emit('message', msg);
  });

  socket.on('nickChange', (nick, id) => {
    const userPosition = onlineUsers.findIndex((usr) => usr.userId === id);
    console.log(
      `Usuário ${onlineUsers[userPosition].userId} mudou o nickname de ${onlineUsers[userPosition].nickname} para ${nick}.`,
    );
    onlineUsers[userPosition].nickname = nick;
    io.emit('nickChange', nick, id);
  });
});

http.listen(process.env.PORT || 3000);
