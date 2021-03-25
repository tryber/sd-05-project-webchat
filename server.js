const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const cors = require("cors");
const moment = require("moment");
const { saveMessages, getMessages } = require("./model/webChatModel");
const faker = require('faker');

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "public");
app.use(express.json());

app.get("/", async (_req, res) => {
  const historyMessages = await getMessages();
  console.log("server L18", historyMessages);
  res.render("index", { historyMessages });
});

// LISTA DE TODOS OS USUARIOS ONLINE
// ARRAY??

// COMO ARMAZENAR NESTA LISTA UM NOVO USUARIO?

// COMO ENVIAR ESTA LISTA PARA O FRONT END MOSTRAR NA TELA?


const usersOnLine = [];

io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);
  const userId = socket.id;
  const randomName = faker.name.findName();
  const user = { userId, randomName };
  usersOnLine.push(user);
  socket.emit("joinRoom", randomName);
  socket.emit("history");
  socket.emit("usersOnline", usersOnLine);

  // Handle chat event
  socket.on("message", async (data) => {
    console.log(data);
    const { chatMessage, nickname } = data;
    const realTime = moment(new Date()).format("DD MM YYYY hh:mm:ss");
    const msgFormated = `${realTime} - ${nickname}: ${chatMessage}`;
    console.log("server L28", msgFormated);
    await saveMessages({ realTime, nickname, chatMessage });
    io.emit("message", msgFormated);
  });

  // socket.on('saveNickName', ({ nickname: user }) => {
  //   const 
  // })

  // Handle typing event
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});

server.listen(3000, () => console.log("Listening on port 3000"));
