require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

// Servidor express
// app.listen(3000, () => {
//   console.log('app on 3000')
// })

// Servidor Socket (e express no mesmo servidor)
const socketIOServer = http.createServer(app);
const io = socketIo(socketIOServer);

socketIOServer.listen(PORT, () => {
  console.log(`Servidores ouvindo na porta ${PORT}`);
});
