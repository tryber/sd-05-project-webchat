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
    li.setAttribute('data-testid', 'message');
    li.textContent = fullMessage;
    divMessages.append(li);
  });

  // [Req4] Adapt dom everytime users change something

  // being able to check if user is current user
  let currentId = '';
  clientSocketIo.on('seeUserId', (id) => {
    currentId = id;
  });

  // when user connects
  clientSocketIo.on('userConnected', (id, nickname) => {
    const divUsers = document.getElementById('users');
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', `${id}`);
    li.textContent = nickname;
    if (id === currentId) {
      divUsers.prepend(li);
      // https://developer.mozilla.org/fr/docs/Web/API/ParentNode/prepend
    } else {
      divUsers.append(li);
    }
  });

  // when user changes nickname
  clientSocketIo.on('showChangedNickname', (id, nickname) => {
    const liToChange = document.getElementById(id); // or querySelector?
    liToChange.innerHTML = nickname;
  });

  // when user disconnects
  clientSocketIo.on('userDisconnected', (id) => {
    const liToDelete = document.getElementById(id);
    console.log(liToDelete);
    liToDelete.remove();
  });
};
