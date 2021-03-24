// Desenvolvimento em conjuto do Samu =  PR #32
const express = require("express");
const cors = require("cors");

const {
  createMessage,
  createPrivateMessage,
  getMessages,
} = require("./model/messagesModel");

const app = express();

// require socket.io e protocolo http
const http = require("http");
const socketIo = require("socket.io");

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server);

const path = require("path");
const moment = require("moment");

app.use(express.json());
app.use(cors());

// rota app.use do diretorio public
app.use("/", express.static(path.join(__dirname, "public")));

const onlineUsers = {};

// concectando socket
io.on("connection", async (socket) => {
  const messages = await getMessages();
  io.to(socket.id).emit("displayHistory", messages, "public");

  socket.on("userConnection", (currentUser) => {
    onlineUsers[socket.id] = currentUser;
    io.emit("displayUsers", onlineUsers);
  });

  socket.on("updateNick", (nickname) => {
    onlineUsers[socket.id] = nickname;
    io.emit("displayUsers", onlineUsers);
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("displayUsers", onlineUsers);
  });

  socket.on('message', async ({ nickname, chatMessage, addressee }) => {
    let msg;
    if (!addressee) {
      msg = await createMessage({
        nickname,
        message: chatMessage,
        timestamp: moment(new Date()).format("DD-MM-yyyy hh:mm:ss"),
      });
      io.emit(
        "message",
        `${msg.timestamp} - ${nickname}: ${chatMessage}`,
        "public"
      );
    } else {
      msg = await createPrivateMessage({
        nickname,
        message: chatMessage,
        timestamp: moment(new Date()).format("DD-MM-yyyy hh:mm:ss"),
        addressee,
      });
      // https://socket.io/docs/v3/rooms/
      io.to(socket.id)
        .to(addressee)
        .emit(
          "message",
          `${msg.timestamp} (private) - ${nickname}: ${chatMessage}`,
          "private"
        );
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Endpoint GET para mensagens
// exemplo de ejs response.render('caminho', {objeto no ejs que quer chamar});
// app.get('/', async (req, res) => {
//   const getAllMessages = await getMessages();
//   res.status(200).render('index', { getAllMessages });
// });
// ----------------------------------------------------------------------------------------------

const PORT = 3000;
// const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
