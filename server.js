const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const expressPORT = 3000;
const socketIoPORT = 4555;

const socketIoServer = require('http').createServer();
const io = require('socket.io')(socketIoServer, {
  cors: {
    origin: `http://localhost:${expressPORT}`,
    methods: ['GET', 'POST'],
  },
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/message', (req, res) => {
  const { message } = req.body;
  // const { chatMessage, nickname } = message;

  if (!message) {
    return res.status(422).json({ message: 'No messages have been sent!' });
  }

  io.emit('message', message);

  res.status(200).json({ message: 'Message emitted' });
});

app.listen(expressPORT, () => console.log(`Express: rodando na porta ${expressPORT}...`));

app.listen(socketIoPORT, () => console.log(`Socket.io: rodando na porta ${socketIoPORT}...`));
