const express = require('express');
const cors = require('cors');

const app = express();

const server = require('http').createServer(app);

const controller = require('./controllers');
const connection = require('./models/connection.model');

app.use(cors());
app.set('view engine', 'ejs');

controller.run(server)(connection);
controller.view(app)(connection);

server.listen(3000, () => {
  console.log(`Rodando na porta ${3000}`);
});
