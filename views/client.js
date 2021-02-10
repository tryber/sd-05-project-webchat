window.onload = () => {
  const clientSocketIo = window.io();

  let currentUserName = '';
  clientSocketIo.on('seeUserName', (userName) => {
    currentUserName = userName;
  });

  const btnEnviar = document.querySelector('#btn-enviar');
  btnEnviar.addEventListener('click', () => {
    let nickname = document.querySelector('#nickname').value;
    const chatMessage = document.querySelector('.textarea').value;
    if (nickname.length > 0) {
      clientSocketIo.emit('userChangedNickname', nickname);
    } else {
      nickname = currentUserName;
    }
    clientSocketIo.emit('message', { chatMessage, nickname });
  });

  clientSocketIo.on('message', (fullMessage) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'message');
    li.textContent = fullMessage;
    document.querySelector('#messages').appendChild(li);
  });

  let currentId = '';
  clientSocketIo.on('seeUserId', (id) => {
    currentId = id;
  });

  clientSocketIo.on('userConnected', (id, name) => {
    const divUsers = document.querySelector('#users');
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', `${id}`);
    li.textContent = name;
    if (id === currentId) {
      divUsers.prepend(li);
    } else {
      divUsers.append(li);
    }
  });

  clientSocketIo.on('showChangedNickname', (id, nick) => {
    const liToChange = document.getElementById(id);
    liToChange.innerHTML = nick;
  });

  clientSocketIo.on('userDisconnected', (id) => {
    const liToDelete = document.getElementById(id);
    console.log(liToDelete);
    liToDelete.remove();
  });
};
