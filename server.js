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

function* idGeneratior() {
  let id = 0;
  while (true) {
    yield (id += 1);
  }
}
const GiveId = idGeneratior();

app.use(cors());

// DD-MM-yyyy HH:mm:ss ${message.nickname} ${message.chatMessage} FORMATO
app.set('view engine', 'ejs');
app.set('views', './views');
app.get('/', async (req, res) => {
  const allMessages = await connection().then((db) =>
    db.collection('messages').find().toArray());
  console.log(allMessages);
  res.status(200).render('index', { id: GiveId.next().value, allMessages });
});
io.on('connection', async (socket) => {
  /* connection()
    .then((db) => db.collection('messages').find().toArray())
    .then((allMessages) => {
      socket.emit('oldMessages', allMessages);
    }); */
  socket.on('message', ({ chatMessage, nickname }) => {
    console.log(`aqui ===>${chatMessage} ${nickname}`);

    const time = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    const storeDB = `${time} - ${nickname}: ${chatMessage}`;
    connection().then((db) => db.collection('messages').insertOne({ message: storeDB }));
    io.emit('message', storeDB);
  });
  socket.on('disconnect', () => {
    console.log(
      'Lembre-se de deixar tudo relacionado a "conexão socket" dentro do evento "connection"',
    );
  });
});

// app.listen(PORT, () => console.log(`batendo na porta ${PORT}`));
socketIoServer.listen(PORT, () => console.log(`ICQ na porta ${PORT}`));
