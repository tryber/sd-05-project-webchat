const moment = require('moment');
const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http//localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { addMessage } = require('./models/Message');

app.use(cors());

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => console.log('User disconnected'));

  socket.on('message', async ({ chatMessage, nickname }) => {
    const timestamp = moment().format('DD-MM-YYYY hh:mm:ss A');
    await addMessage({ chatMessage, nickname, timestamp });
    const msgString = `${timestamp} - ${nickname}: ${chatMessage}`;
    io.emit('message', msgString);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => console.log(`Listening on port ${PORT}`));
