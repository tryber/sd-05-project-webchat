window.onload = () => {
  // make connection
  const socket = window.io.connect('http://localhost:3000');

  // buttons and inputs
  const myUserName = document.getElementById('online');
  // const message = document.getElementById('message');
  const username = document.getElementById('username');
  const usersList = document.getElementById('userList');
  const sendMessage = document.getElementById('send-button');
  const sendUsername = document.getElementById('send_username');
  const chatroom = document.getElementById('message-box');
  const chat = document.getElementById('chatlog');
  // const feedback = document.getElementById('feedback');
  const publicButton = document.getElementById('public');

  // userInfo
  let nickname = myUserName.innerHTML;

  const userData = {
    nickname,
    socketId: socket.id,
  };

  const alvo = {
    alvo: '',
  };
  // let publicLog = [];
  // let privateLog = [];

  // private chat logs
  // const privateMsgLogs = () => {};

  // Emit userData
  socket.emit('userData', { userData });

  /* LEMBRAR DE RE-IMPLANTAR DEPOIS
  // Emit typing
  message.bind('keypress', () => {
    socket.emit('typing');
  });
  // Listen on typing
  socket.on('typing', (data) => {
    feedback.html('<p><i>' + data.username + ' is typing a message... ' + '</i></p>');
    setTimeout(function () {
      feedback.html('');
    }, 1000);
  }); */

  // Listen update users
  socket.on('updateUser', ({ usersOnline }) => {
    usersList.innerHTML = `<li data-testid="online-user">${usersOnline[socket.id].nickname}</li>`;
    console.log(usersOnline);
    Object.values(usersOnline).forEach((user) => {
      console.log(user);
      if (user.socketId === socket.id) return;
      // usersList.innerHTML.appendChild(`<li data-testid="online-user">${user.nickname}</li>`);
      const newUser = document.createElement('li');
      newUser.innerHTML = user.nickname;
      newUser.setAttribute('data-testid', 'online-user');
      usersList.appendChild(newUser);
      const privateButton = document.createElement('button');
      privateButton.setAttribute('data-testid', 'private');
      privateButton.innerHTML = 'DM';
      privateButton.addEventListener('click', () => {
        alvo.alvo = user.socketId;
        chat.innerHTML = '';
        socket.emit('private_message', alvo.alvo);
      });
      usersList.appendChild(privateButton);
      console.log('teste', user.socketId);
    });
  });

  // public
  publicButton.addEventListener('click', () => {
    chat.innerHTML = '';
    socket.emit('public_message');
  });

  // Emit message
  sendMessage.addEventListener('click', () => {
    socket.emit('message', { chatMessage: chatroom.value, nickname, alvo: alvo.alvo });
  });

  // Listen on new_message
  socket.on('message', (chatMessage) => {
    const sentMessage = document.createElement('li');
    sentMessage.innerHTML = chatMessage;
    sentMessage.setAttribute('data-testid', 'message');
    chat.appendChild(sentMessage);
  });

  // Listen on prtvt
  socket.on('chat-log', (chatlog) => {
    chatlog.forEach((chatMessage) => {
      const sentMessage = document.createElement('li');
      sentMessage.innerHTML = chatMessage.msgs;
      sentMessage.setAttribute('data-testid', 'message');
      chat.appendChild(sentMessage);
    });
  });

  // Emit a username
  sendUsername.addEventListener('click', () => {
    userData.nickname = username.value;
    nickname = userData.nickname;
    userData.socketId = socket.id;
    socket.emit('change_username', { userData });
  });
};
