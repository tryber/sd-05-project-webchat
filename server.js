require('dotenv').config();
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
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');

const messagesModel = require('./models/messagesModel');

// const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());
app.use(parser.urlencoded({ extended: true}));
app.use(parser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Arquivos estáticos dentro da pasta views
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', async (req, res) => {
  const historyMessage = await messagesModel.getAll();
    res.render('index', { historyMessage});
});

  io.on('connection', (socket) => {
    console.log(`${socket.id} now connected`);
    socket.emit('message', 'Welcome to server!');
    
    socket.on('disconnect', () => {
    console.log('Client disconnected');
    });
  
    socket.on('message', async (message) => {
      console.log(message)
      await messagesModel.postMessage(message);
      // io.emit('message', data);
      socket.broadcast.emit('message', message);
    });
  
  socket.on('error', error => {
    console.log('Socket error: ', error.message)
  });
  
});

io.on('error', error => {
  console.log('Server error: ', error.message)
});

// app.post('/notify', (req, res) => {
// //   const { notification } = req.body;
// //   if (!notification) {
// //     return res.status(422).json({ message: 'Missing not notification' });
// //   };
// // io.emit('notication', notification);

//   const { chatMessage, nickname } = req.body;
//   if (!chatMessage || !nickname) {
//     return res.status(422).json({ message: 'Missing not notification' });
//   };
//   io.emit('notitication', { chatMessage, nickname });
//   res.status(200).json({ message: 'Notification emitted' });

// });

http.listen(PORT, ()=> console.log(`The Shinning is listening on ${PORT}!`))
