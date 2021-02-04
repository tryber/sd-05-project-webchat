const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const socketIoServer = require('http').createServer();
// const io = require('socket.io')(socketIoServer);

// const socket_io = require('socket.io');
// const http = require('http');
// const socketIoServer = http.createServer();
// const io = socket_io(socketIoServer);

const app = express();

// const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.json());

const PORT = process.env.PORT || 3000;
// app.get('/ping', (_, res) => {
//   res.status(200).json({ message: 'pong!'});
// });

app.get('/', (_, res) => {
  res.sendfile('index.html');
});

io.on('connection', (socket) => {
  console.log('New Client connected: ', socket.id);
  socket.emit('message', 'Wellcome to server!');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('error', error => {
    console.log('Socket error: ', error.message)
  })

});

io.on('error', error => {
  console.log('Server error: ', error.message)
})

app.post('/notify', (req, res) => {
//   const { notification } = req.body;
//   if (!notification) {
//     return res.status(422).json({ message: 'Missing not notification' });
//   };
// io.emit('notication', notification);

  const { chatMessage, nickname } = req.body;
  if (!chatMessage || !nickname) {
    return res.status(422).json({ message: 'Missing not notification' });
  };
  io.emit('notitication', { chatMessage, nickname });
  res.status(200).json({ message: 'Notification emitted' });

});

http.listen(PORT, ()=> console.log(`The Shinning is listening on ${PORT}!`))

// app.listen(3000);
// console.log('Express na 3000');

// socketIoServer.listen(4555);
// console.log('Socket.io na 4555');