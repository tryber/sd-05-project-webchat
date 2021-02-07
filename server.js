const express = require('express');
const controller = require('./controllers');
const connection = require('./models/connection.model');

const app = express();
const server = require('http').createServer(app);

app.set('view engine', 'ejs');
controller.run(server)(connection);
controller.view(app)(connection);

app.listen(3000, () => { console.log('online'); });