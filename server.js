const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
// const cors = require('cors');


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html')
});

let messages = [];

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  socket.emit('previousMessages', messages);

  socket.on('sendMessage', data => { // evento socket: para ouvir uma mensagem 
    messages.push(data);
    console.log(data);
    socket.broadcast.emit('receivedMessage', data); // evento socket: envia para todos os sockets que estão na aplicação.
  })
});

server.listen(3000);