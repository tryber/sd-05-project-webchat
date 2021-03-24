const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const cors = require('cors');
const moment = require('moment');
// const { saveMessages, getMessages } = require('./model/webChatModel');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile('index.html')
});

io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);

// Handle chat event
socket.on('message', async (data) => {
    console.log(data);
    const realTime = moment(new Date()).format("DD MM YYYY hh:mm:ss");
    const msgFormated = `${realTime} - ${data.nickname}: ${data.chatMessage}`
    console.log('server L28', msgFormated);
    await saveMessages(msgFormated);
    io.emit('message', msgFormated);
});

// Handle typing event
// socket.on('typing', function(data){
//     socket.broadcast.emit('typing', data);

server.listen(3000, () => console.log('Listening on port 3000'));
});