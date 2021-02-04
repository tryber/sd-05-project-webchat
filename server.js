// Back-end server side

// DEPENDENCIES
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const faker = require('faker');
require('dotenv').config();

// IMPORTATIONS
const app = express();
app.use(bodyParser.json());

// SET IO & CORS
const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);
// , {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });
app.use(cors());

// ENDPOINT
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + 'public/client.html');
// });
app.use('/', express.static(path.join(__dirname, 'public')));

// IO LISTENERS TO INTERACT WITH CLIENT SIDE
io.on('connection', (socket) => {
  // console.log(socket);

  console.log(`User ${socket.id} connected`);
  socket.user = { nickname: faker.name.firstName() };
  // to give random nickname at first,
  // reference https://github.com/tryber/sd-04-live-lectures/pull/67/files

  // Communication via emit, reagir a evento via .on
  // socket.emit('ola', 'Bemvindo tal pessoa' );
  // socket.broadcast.emit('mensagemServer', { mensagem: 'Blaaa para todos'});
  // socket.on('mensagem', (msg) => {
  //   io.emit('mensagemServer', { mensagem: msg });
  // });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
