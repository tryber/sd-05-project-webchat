require('dotenv').config();
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');

const io = require('socket.io')(http, {
  cors: {
    origin: process.env.DB_URL || 'http://localhost:3000/', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

const chatHistoryModel = require('./model/chatHistoryModel.js');

const dateFormated = require('./functions/dateFormated');

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(cors());

app.set('view engine', 'ejs');

app.set('views', './views');

app.use(express.static(`${__dirname}/public`)); // para funcionar o css

let usersOnline = [];

app.get('/', async (req, res) => {
  const bd = await chatHistoryModel.getAll();
  const historico = bd.map(({ timestamp, nickname, chatMessage }) => `${timestamp} ${nickname}: ${chatMessage}`);
  res.status(200).render('index.ejs', { historico, usersOnline });
});

io.on('connection', (socket) => {
  let nicknameEsLint = `NickNameInicial - ${usersOnline.length}`;
  usersOnline.push(nicknameEsLint);

  socket.emit('initialNickname', nicknameEsLint);

  socket.on('message', async ({ chatMessage, nickname }) => {
    const timestamp = dateFormated(new Date());
    await chatHistoryModel.create(nickname, chatMessage, timestamp);
    io.emit('message', `${timestamp} ${nickname}: ${chatMessage}`);
  });

  socket.on('changeNickName', ({ oldNickname, nicknameAtual }) => {
    usersOnline = usersOnline.filter((item) => item !== oldNickname);
    usersOnline.push(nicknameAtual);
    nicknameEsLint = nicknameAtual;
    io.emit('listUsersOnline', usersOnline);
  });

  socket.on('disconnect', () => { // ref2
    usersOnline = usersOnline.filter((item) => item !== nicknameEsLint);
    io.emit('listUsersOnline', usersOnline);
  });

  io.emit('listUsersOnline', usersOnline);
});

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});

//  https://www.youtube.com/watch?v=8Y6mWhcdSUM&t=282s - indicação via Telegram do @Dandrea
//  ref2: https://socket.io/docs/v3/client-api/index.html
//  https://stackoverflow.com/questions/18629327/adding-css-file-to-ejs
