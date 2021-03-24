const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const moment = require('moment');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

const { createMessage, getMessages } = require('./models/Messages');

app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (_req, res) => {
  const allMessages = await getMessages();
  res.render('index', { allMessages });
  res.render('index');
});

io.on('connection', async (socket) => {
  console.log(`User ${socket.id} connected`);
  socket.on('message', async ({ chatMessage, nickname }) => {
    const dateNow = new Date().getTime();
    const dateFormat = moment(dateNow).format('DD-MM-yyyy h:mm:ss A');
    const fullMessage = `${dateFormat} - ${nickname}: ${chatMessage}`;
    await createMessage({ dateFormat, nickname, chatMessage });
    io.emit('message', fullMessage); // to have messages displayed for all users
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
