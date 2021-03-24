window.onload = () => {
  const client = window.io();
  let userId;
  let nickname;
  let from;
  let to;

  const allpvtBtns = document.querySelectorAll('#private-btn');
  const sendButton = document.getElementById('send-button');
  const messageBox = document.getElementById('message-box');
  const nicknameBox = document.getElementById('nickname-box');
  const nicknameSave = document.getElementById('nickname-save');
  const onlineUsers = document.getElementById('online-users');
  const publicButton = document.getElementById('public');
  const privateButton = document.getElementById('private');
  const chat = document.getElementById('messages');

  allpvtBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      to = e.target.previousSibling.previousSibling.id;
      client.emit('getchatPrivadoHistorico', userId, to);
    });
  });

  client.on('connected', (id, nick) => {
    userId = id;
    nickname = nick;
    from = id;
  });

  client.on('userConnected', (id, nick) => {
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
        to = id;
        client.emit('getchatPrivadoHistorico', userId, to);
      });
      btn.innerHTML = 'pvt';
      btn.setAttribute('class', 'pvt-chat-btn');
      // btn.setAttribute('data-testid', 'private');
      btn.setAttribute('type', 'button');
      btn.setAttribute('id', 'private-btn');
      div.append(btn);
      onlineUsers.append(div);
    }
  });

  client.on('changeNickname', (nick, id) => {
    const changeNicknameUser = document.getElementById(id);
    changeNicknameUser.innerHTML = nick;
  });

  client.on('message', (msg) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'message');
    li.innerHTML = msg;
    chat.append(li);
  });

  client.on('userDisconectado', (id) => {
    const disconnectedUser = document.getElementById(id).parentNode;
    disconnectedUser.remove();
  });

  client.on('history', (history) => {
    chat.innerHTML = '';
    history.forEach((msg) => {
      if (!msg.to) {
        const li = document.createElement('li');
        li.setAttribute('data-testid', 'message');
        li.innerHTML = `${msg.date} - ${msg.nickname}: ${msg.chatMessage}`;
        chat.append(li);
      }
    });
  });

  client.on('chatPrivadoHistorico', (history) => {
    chat.innerHTML = '';
    history.forEach((msg) => {
      const li = document.createElement('li');
      li.setAttribute('data-testid', 'message');
      li.innerHTML = `${msg.date} - ${msg.nickname} (private): ${msg.chatMessage}`;
      chat.append(li);
    });
  });

  sendButton.addEventListener('click', () => {
    const chatMessage = messageBox.value;
    messageBox.value = '';
    client.emit('message', { nickname, chatMessage, to, from });
  });

  nicknameSave.addEventListener('click', () => {
    nickname = nicknameBox.value;
    client.emit('changeNickname', nickname, userId);
  });

  publicButton.addEventListener('click', () => {
    client.emit('getMsgHistory');
    to = null;
  });

  privateButton.addEventListener('click', () => {
    to = document.querySelectorAll('[data-testid="online-user"]')[1].id;
    client.emit('getchatPrivadoHistorico', userId, to);
  });
};
