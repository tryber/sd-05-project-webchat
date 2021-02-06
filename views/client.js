// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files
window.onload = () => {
  const clientSocketIo = window.io();

  // See if nickname is default or chosen by user depending on Save button
  let nickname = 'randomName';
  const chosenNickname = document.getElementById('nickname-input');
  const nicknameBtn = document.getElementById('nickname-save');
  nicknameBtn.addEventListener('click', async () => {
    nickname = await chosenNickname.value;
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

  // [Req4] Adapt dom everytime users change something

  // when current user connects
  clientSocketIo.on('userConnected', (id, nickname) => {
    // TODO: we want the new user to be displayed top of the list
    const divUsers = document.getElementById('top-user');
    const li = document.createElement('li');
    li.setAttribute('data-tested', 'online-user');
    li.setAttribute('id', `${id}`);
    li.textContent = nickname;
    divUsers.append(li);
  });

  // when another user connects
  clientSocketIo.on('otherUserConnected', (idOther, nickname) => {
    // we want the other user to be displayed last on the list
    const divUsers = document.getElementById('users');
    const li = document.createElement('li');
    li.setAttribute('data-tested', 'online-user');
    li.setAttribute('id', `${idOther}`);
    li.textContent = nickname;
    divUsers.append(li);
  });

  // when current user changes nickname
  clientSocketIo.on('showChangedNickname', (id, nickname) => {
    const liToChange = document.getElementById(`${id}`); // or querySelector?
    liToChange.innerHTML = nickname;
  });

  // when another user changes nickname
  clientSocketIo.on('showAnotherUserChanging', (idOther, nickname) => {
    const liToChange = document.getElementById(`${idOther}`);
    liToChange.innerHTML = nickname;
  });

  // when any user disconnects
  clientSocketIo.on('userDisconnected', (id) => {
    const liToDelete = document.getElementById(`${id}`);
    // liToDelete.innerHTML = ''; need this?
    liToDelete.remove();
  });
};

// 05.01 night, pending backlog:
// - be able to put users in right order
// - not being an array
// - fix the time out & protocol erros, received both on req2&4
