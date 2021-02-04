// Back-end server side

// DEPENDENCIES

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const faker = require('faker');
const moment = require('moment');
require('dotenv').config();

// IMPORTATIONS

const app = express();
app.use(bodyParser.json());
// const { createMessage } = require('./models/messageModel');

// SET IO & CORS

const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);
// , {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// }); - no need for these specifications
app.use(cors());

// ENDPOINT

app.use(express.static(path.join(__dirname, 'views')));
// informing express to use static file inside views directory
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (_req, res) => {
  const data = [];
  res.render('index', data);
  // now inside index.ejs you can use these data, this was like passing a props
})

// IO LISTENERS - INTERACTION WITH CLIENT SIDE

io.on('connection', async (socket) => {
  console.log(`User ${socket.id} connected`);
  // Create random nickname (https://www.npmjs.com/package/faker) and inject it in socket
  socket.user = { nickname: faker.name.firstName() };
  // nickname logic: or user stays with its random one, or user picks and save one
  // firstNickname = socket.user.nickname;

  socket.on('message', async ({ chatMessage, nickname }) => {
    const dateNow = new Date().getTime();
    const dateFormat = moment(dateNow).format('DD-MM-yyyy h:mm:ss A');
    const fullMessage = `${dateFormat} - ${nickname}: ${chatMessage}`;
    // req3 will keep this message in BD, calling function from model
    // await createMessage(fullMessage);
    
    socket.broadcast.emit('message', fullMessage);
    // io.emit('message', fullMessage);
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
