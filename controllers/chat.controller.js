module.exports = (server) => async (connection) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: [ 'GET', 'POST' ],
    }
  });

  const collection = await connection('messages');

  io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    //default username
    socket.username = "Anonymous"

    //listen new players
    socket.on('new_guest', async () => {
      // const messages = await collection.find({}).toArray();
      console.log(messages);
    });
  });
};
