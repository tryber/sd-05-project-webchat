const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', async (socket) => {
  console.log(`${socket.id} just connected!`);
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
