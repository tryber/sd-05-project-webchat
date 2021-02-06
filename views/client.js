// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files
window.onload = () => {
  const clientSocketIo = window.io();

  // See if nickname is default or chosen by user depending on Save button
  let nickname = 'randomName';
  const chosenNickname = document.getElementById('nickname-input');
  const nicknameBtn = document.getElementById('nickname-save');
  nicknameBtn.addEventListener('click', () => {
    nickname = chosenNickname.value;
    clientSocketIo.emit('userChangedNickname', nickname);
  });
  
  // [Req2] 1. User click send message
  const sendBtn = document.getElementById('send');
  sendBtn.addEventListener('click', () => {
    const chatMessage = document.getElementById('message-input').value;
    clientSocketIo.emit('message', { chatMessage, nickname });
  });

  // [Req2] 3. Show the formatted message on the chat div
  clientSocketIo.on('message', (fullMessage) => {
    const divMessages = document.getElementById('messages');
    const li = document.createElement('li');
    li.setAttribute('data-tested', 'message');
    li.textContent = fullMessage;
    divMessages.append(li);
  });

  // [Req4] Adapt dom whenever users connect, change nickname and disconnect

  clientSocketIo.on('userConnected', (id, nickname) => {
    const divUsers = document.getElementById('users');
    const li = document.createElement('li');
    li.setAttribute('data-tested', 'online-user');
    li.setAttribute('id', `${id}`);
    li.textContent = nickname;
    divUsers.append(li);
    // this way, last connected goes at the end of the list
  });

  clientSocketIo.on('showChangedNickname', (id, nickname) => {
    const liToChange = document.getElementById(`${id}`); // or querySelector?
    liToChange.innerHTML = nickname;
  });

  clientSocketIo.on('showAnotherUserChanging', (idOther, nickname) => {
    const liToChange = document.getElementById(`${idOther}`);
    liToChange.innerHTML = nickname;
  });

  clientSocketIo.on('userDisconnected', (id) => {
    const liToDelete = document.getElementById(`${id}`);
    // liToDelete.innerHTML = ''; need this?
    liToDelete.remove();
  });
};
