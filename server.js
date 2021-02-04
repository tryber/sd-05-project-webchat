require('dotenv').config();
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const client = require('socket.io')(server);

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');

const { createMessage } = require('./models/messageModel');
const messageController = require('./controllers/messageController');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', messageController);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

client.on('connection', async (socket) => {
  console.log(`User (${socket.id}) has connected...`);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const date = new Date().getTime();
    const timestamp = moment(date).format('DD-MM-yyyy hh:mm:ss');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage(nickname, chatMessage, timestamp);

    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`User (${socket.id}) has disconnected.`);
  });
});
