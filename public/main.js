window.onload = () => {
  const socket = window.io();
  let userId;
  let nickname;
  let de;
  let para;

  const btnPrivadoDireto = document.querySelectorAll('#private-btn');
  const btnEnviar = document.getElementById('send-button');
  const messageBox = document.getElementById('message-box');
  const nicknameBox = document.getElementById('nickname-box');
  const btnSaveNickname = document.getElementById('nickname-save');
  const onlineUsers = document.getElementById('online-users');
  const btnPublico = document.getElementById('public');
  const btnPrivado = document.getElementById('private');
  const chat = document.getElementById('messages');

  btnPrivadoDireto.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      para = e.target.previousSibling.previousSibling.id;
      socket.emit('getchatPrivadoHistorico', userId, para);
    });
  });

  socket.on('connected', (id, nick) => {
    userId = id;
    nickname = nick;
    de = id;
  });

  socket.on('userConnected', (id, nick) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', `${id}`);
    li.innerHTML = nick;
    const div = document.createElement('div');
    div.setAttribute('class', 'pvt-chat-box');
    div.append(li);
    if (userId === id) {
      onlineUsers.prepend(div);
    } else {
      const btn = document.createElement('button');
      btn.addEventListener('click', (e) => {
        para = id;
        console.log(e.event.value);
        socket.emit('getchatPrivadoHistorico', userId, para);
      });
      btn.innerHTML = 'pvt';
      btn.setAttribute('class', 'pvt-chat-btn');
      btn.setAttribute('type', 'button');
      btn.setAttribute('id', 'private-btn');
      div.append(btn);
      onlineUsers.append(div);
    }
  });

  socket.on('changeNickname', (nick, id) => {
    const changeNicknameUser = document.getElementById(id);
    changeNicknameUser.innerHTML = nick;
  });

  socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'message');
    li.innerHTML = msg;
    chat.append(li);
  });

  socket.on('userDisconectado', (id) => {
    const disconnectedUser = document.getElementById(id).parentNode;
    disconnectedUser.remove();
  });

  socket.on('history', (history) => {
    chat.innerHTML = '';
    history.forEach((msg) => {
      if (!msg.para) {
        const li = document.createElement('li');
        li.setAttribute('data-testid', 'message');
        li.innerHTML = `${msg.date} - ${msg.nickname}: ${msg.chatMessage}`;
        chat.append(li);
      }
    });
  });

  socket.on('chatPrivadoHistorico', (history) => {
    chat.innerHTML = '';
    history.forEach((msg) => {
      const li = document.createElement('li');
      li.setAttribute('data-testid', 'message');
      li.innerHTML = `${msg.date} - ${msg.nickname} (private): ${msg.chatMessage}`;
      chat.append(li);
    });
  });

  btnEnviar.addEventListener('click', () => {
    const chatMessage = messageBox.value;
    messageBox.value = '';
    socket.emit('message', { nickname, chatMessage, para, de });
  });

  btnSaveNickname.addEventListener('click', () => {
    nickname = nicknameBox.value;
    socket.emit('changeNickname', nickname, userId);
  });

  btnPublico.addEventListener('click', () => {
    socket.emit('getMsgHistory');
    para = null;
  });

  btnPrivado.addEventListener('click', () => {
    para = document.querySelectorAll('[data-testid="online-user"]')[1].id;
    socket.emit('getchatPrivadoHistorico', userId, para);
  });
};
