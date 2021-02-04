require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

io.on('connection', async (socket) => {
  console.log(`Socket conectado ${socket.id}`);
  socket.on('sendMessage', (data) => {
    console.log(data);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`O pai ta na porta ${port}`);
});
