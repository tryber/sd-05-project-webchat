// DEPENDENCIES
const app = require('express')();
const bodyParser = require('body-parser');
require('dotenv').config();

// IMPORTATIONS
const app = express();
app.use(bodyParser.json());

// SET IO & CORS
const webchatServer = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(webchatServer);
// , {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   }
// });

app.use(cors()); // Permite recursos restritos na página web serem pedidos a domínio externo

// ENDPOINT
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

// IO LISTENERS
io.on('connection', (socket) => {
  // console.log(socket);
  console.log(`User ${socket.id} connected`);

  // socket.emit('ola', 'Bem vindo fulano, fica mais um cadin, vai ter bolo :)' );

  // socket.broadcast.emit('mensagemServer', { mensagem: ' Iiiiiirraaaa! Fulano acabou de se conectar :D'});

  // socket.on('mensagem', (msg) => {
  //   io.emit('mensagemServer', { mensagem: msg });
  // });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// PORT LISTENER
const PORT = process.env.PORT || 3000;
webchatServer.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
