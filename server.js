const PORT = process.env.PORT || 3000;

require('dotenv').config();

const dateFormat = require('dateformat');

const app = require('express')();

const http = require('http');

const socketIoServer = http.createServer(app);

const socketIo = require('socket.io');

const io = socketIo(socketIoServer, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

const cors = require('cors');
const connection = require('./model/connection');

app.use(cors());

let users = [];

app.use(cors());

// DD-MM-yyyy HH:mm:ss ${message.nickname} ${message.chatMessage} FORMATO
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (_req, res) => {
  const allMessages = await connection().then((db) =>
    db.collection('messages').find().toArray());
  res.status(200).render('index', { allMessages, allUsers: users });
});

io.on('connection', async (socket) => {
  // io.broadcast.emit('newUser', )

  socket.on('newUser', ({ nickname }) => {
    const { id } = socket;
    users.push({ id, nickname });
    io.emit('UpdateUsers', { users });
  });
  socket.on('message', ({ chatMessage, nickname }) => {
    const time = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    const storeDB = `${time} - ${nickname}: ${chatMessage}`;
    connection().then((db) => db.collection('messages').insertOne({ message: storeDB }));
    io.emit('message', storeDB);
  });
  socket.on('nicknameChanged', ({ nickname }) => {
    users.find((user) => user.id === socket.id).nickname = nickname;
    io.emit('UpdateUsers', { users });
  });
  socket.on('disconnect', () => {
    users = users.filter((e) => e.id !== socket.id);
    io.emit('UpdateUsers', { users });
    console.log(socket.id, 'foi desconectado');
  });
});

// app.listen(PORT, () => console.log(`batendo na porta ${PORT}`));
socketIoServer.listen(PORT, () => console.log(`ICQ na porta ${PORT}`));
