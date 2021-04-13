// Back-end server side

// DEPENDENCIES

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
require('dotenv').config();

// IMPORTATIONS

const app = express();
app.use(bodyParser.json());

// SET IO & CORS

const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);

app.use(cors());

// MODEL
const { createMessage, getMessages } = require('./models/messagesModel');
// const { emit } = require('process');

// ENDPOINT

app.use(express.static(path.join(__dirname, 'views')));
// informing express to use static file inside specified directory
app.set('view engine', 'ejs');
app.set('views', './views');

let onlineUsers = [];

app.get('/', async (_req, res) => {
  const allMessages = await getMessages();
  res.render('index', { allMessages, onlineUsers });
  // to be able to pass data to index.ejs, like passing a props
});

// IO LISTENERS - INTERACTION WITH CLIENT SIDE

io.on('connection', (socket) => {
  const currentUserId = socket.id;
  const defaultNickname = 'randomName';

  console.log(`User ${currentUserId} connected`);

  // [Req4] Take id and default nickname of connecting users
  // send to onlineUsers array, to render in ejs (need to refresh)
  onlineUsers.unshift({ id: currentUserId, nickname: defaultNickname });
  // also send to client, to render in dom manipulation (real time)
  socket.emit('seeUserId', currentUserId);
  io.emit('userConnected', currentUserId, defaultNickname);

  socket.on('userChangedNickname', (newNickname) => {
    // [Req4] when user changes from random nickname to chosen nickname, it is replaced
    // refresh onlineUsers
    onlineUsers = onlineUsers.map((user) => {
      if (user.id === currentUserId) {
        const userToChange = user;
        userToChange.nickname = newNickname;
        return userToChange;
      }
      return user;
    });
    // refresh also client dom
    io.emit('showChangedNickname', currentUserId, newNickname);
  });

  // [Req2] 2. Receive 'message' emitted by client and emit back the formatted one
  socket.on('message', async ({ chatMessage, nickname }) => {
    const dateNow = new Date().getTime();
    const dateFormat = moment(dateNow).format('DD-MM-yyyy h:mm:ss A');
    const fullMessage = `${dateFormat} - ${nickname}: ${chatMessage}`;
    await createMessage({ dateFormat, nickname, chatMessage });
    io.emit('message', fullMessage);
  });

  socket.on('disconnect', () => {
    console.log(`User ${currentUserId} disconnected`);
    // [Req4] When user disconnects and needs to disappear from the list of online users
    // refresh onlineUsers
    onlineUsers = onlineUsers.filter((user) => user.id !== currentUserId);
    // refresh also client dom
    io.emit('userDisconnected', currentUserId);
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});

// General project comments:
// I - Default nickname could have been:
// - with package faker const defaultNickname = faker.name.firstName();
// - with formula `User${Math.round(Math.random() * 1000)}`
// II - Good practice of architecture: view vs public directory
// - "views" is what interacts with user so it fits (chosen one here);
// - but "public" could have been better, it is where static is supposed to be.
// III - Chosing in which position to push a new element within an array:
// - unshift to push at the beginning, ref https://www.w3schools.com/jsref/jsref_unshift.asp
// IV - Declaring io with specifics (were not needed here, l20)
// , {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// Academic honesty: needed help from students Felipe, Dandrea, Cesar.
