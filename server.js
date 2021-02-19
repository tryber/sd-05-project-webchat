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

const PORT = parseInt(process.env.PORT, 10) || 3000;

const dateFormated = (dataDeCriacao) => {
  let meridium;
  if (dataDeCriacao.getHours() >= 12) {
    meridium = 'PM';
  } else {
    meridium = 'AM';
  }
  let [month, date, year] = dataDeCriacao.toLocaleDateString('en-US').split('/');
  month = (`00${month}`).slice(-2);
  date = (`00${date}`).slice(-2);
  year = `${year} `.trim();
  const [hour, minute, second] = dataDeCriacao.toLocaleTimeString('en-US').split(/:| /);
  return `${date}-${month}-${year} ${hour}:${minute}:${second} ${meridium}`;
  //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  //  https://pt.stackoverflow.com/questions/175662/fun%C3%A7%C3%A3o-javascript-que-complete-o-campo-com-zeros-%C3%A0-esquerda
};

app.use(cors());

app.set('view engine', 'ejs');

app.set('views', './views');

app.use(express.static('./'));

app.get('/', (req, res) => {
  res.status(200).render('index.ejs');
});

io.on('connection', (socket) => {
  socket.on('message', async ({ chatMessage, nickname }) => {
    const timestamp = dateFormated(new Date());
    await chatHistoryModel.create(nickname, chatMessage, timestamp);
    io.emit('message', `${timestamp} ${nickname}: ${chatMessage}`);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});

//  https://www.youtube.com/watch?v=8Y6mWhcdSUM&t=282s - indicação via Telegram do @Dandrea
