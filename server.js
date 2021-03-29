const express = require('express');
const cors = require('cors');
require('dotenv').config();

const onlineUsers = [];

const PORT = process.env.PORT || 3000;
const FIVEHUNDRED = 500;

const app = express();
app.set('views', './Views');
app.set('view engine', 'ejs');

// Connections
const server = require('http').createServer(app);
const mongoConnection = require('./Models/mongoDBModel');

// Controllers
const chatController = require('./Controllers/chatController');
const home = require('./Controllers/homeController');

// Setup
const serverConfig = {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
};

// Chat connections
const chatConnections = {
  mongoConnection,
};

// Middlewares
app.use(cors());
app.use('/', home);

// Iniciando o chat
chatController.run(server, serverConfig)(chatConnections, onlineUsers);

// Middleware de tratamento de erro
const errorMiddleware = (err, _req, res, _next) => {
  console.error(err);
  const { message } = err;
  res.status(FIVEHUNDRED).json({ message });
};

app.use(errorMiddleware);

// rodando o servidor
server.listen(PORT, () => {
  console.log(`O PAI TÁ ON NA PORTA ${PORT}`);
});
