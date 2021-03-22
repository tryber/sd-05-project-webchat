const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
// Definindo protocolo HTTP
const server = http.createServer(app);
// Definindo protocolo WebSocket
const io = socketio(server);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', async (_req, res) => {
  // const allMessages = await getMessages();
  res.render('index.ejs');
});

// run when client connects
// Seu back-end deve permitir que várias usuários se conectem simultâneamente;
io.on('connection', (socket) => {
  console.log(`New WS Connections... ${socket.id}`);
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
