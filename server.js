const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');

const model = require('./models/messages');
const msgController = require('./controllers/messagesController');

// const io = require('socket.io')(http, {
//   cors: {
//     origin: 'http://localhost:3000', // url aceita pelo cors
//     methods: ['GET', 'POST'], // Métodos aceitos pela url
//   }
// });

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo

app.set('view engine', 'ejs');

app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));

app.get('/', msgController.listMessages);

io.on('connection', (socket) => {
  console.log(`${socket.id} has connected`);
  // const nickname = 'usuário ' + users.length;
  // socket.nickname = nickname;
  // users.push(socket.nickname);
  // recebe msg + nick, insere no banco e devolve para a view:

  socket.on('message', async ({ nickname, newMsg }) => {
    if (!nickname || !newMsg) {
      return socket.emit('status', 'Dados inválidos');
    }
    const time = new Date().toUTCString(); // const dateFormat = require('dateformat')?
    console.log(`Mensagem ${newMsg} por ${nickname}`);
    await model.create({ time, nickname, newMsg }); // ou precisa passar pelo controller?
    socket.broadcast.emit('message', (`${time} - ${nickname}: ${newMsg}`));
    return socket.emit('status', 'mensagem enviada');
  });
  // console.log(`${nickname} conectado`);

  // socket.emit('ola', 'Bem vindo, fica mais um cadin, vai ter bolo :)' );

  // socket.broadcast.emit('onlineUsers', { mensagem: ' ira! Fulano acabou de se conectar :D'});

  // socket.on('mensagemParaTodos', (msg)=> {
  //   io.broadcast('mensagemParaTodos', msg)
  // })

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
});

server.listen(3000, () => {
  console.log('server listening at 3000');
});
