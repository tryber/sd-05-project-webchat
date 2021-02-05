// Back-end server side

// DEPENDENCIES

const express = require('express');
const path = require('path');
// const faker = require('faker');
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
// No need for the following specifications
// , {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
app.use(cors());

// MODEL
const { createMessage, getMessages } = require('./models/messagesModel');

// ENDPOINT

app.use(express.static(path.join(__dirname, 'views')));
// informing express to use static file inside views directory
// Here debate about architecture good practices:
// - "views" is what interacts with user so it fits;
// - but "public" is where static is supposed to be.
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (_req, res) => {
  const allMessages = await getMessages();
  res.render('index', { allMessages });
  // to be able to pass data from the db to index.ejs, like passing a props
  res.render('index');
});

// IO LISTENERS - INTERACTION WITH CLIENT SIDE

io.on('connection', async (socket) => {
  console.log(`User ${socket.id} connected`);

  // 2. Receive 'message' emitted by client and emit back the formatted one
  socket.on('message', async ({ chatMessage, nickname }) => {
    // Failed to use faker package because name came empty
    // const defaultNickname = faker.name.firstName();
    // let finalNickname = '';
    // if (nickname.length > 0) {
    //   finalNickname = nickname;
    // } else {
    //   finalNickname = defaultNickname;
    //   console.log(defaultNickname);
    // }
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
