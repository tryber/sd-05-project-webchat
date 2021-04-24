const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);

const PORT = process.env.PORT || 3000;
const controller = require('./controllers');
const connection = require('./models/connection.model');

app.use(cors());
app.set('view engine', 'ejs');

const { users } = controller;
controller.run(server)(connection);
controller.view(app)(connection, users);

server.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
