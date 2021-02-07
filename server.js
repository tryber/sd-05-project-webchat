const express = require('express');
const cors = require('cors');
const controller = require('./controllers');
const connection = require('./models/connection.model');

const app = express();

app.use(cors());
const server = require('http').createServer(app);

app.set('view engine', 'ejs');
controller.run(server)(connection);
controller.view(app)(connection);

server.listen(3000, () => {
  console.log(`Rodando na porta ${3000}`);
});