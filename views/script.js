const socket = window.io('http://localhost:3000');

const listNameRandom = ['Bane', 'Bruce Wayne', 'Batman', 'Alfred', 'Robin', 'Coringa', 'Espantalho', 'Batgirl', 'Hera Venenosa', 'Mulher-Gato', 'Ras al Ghul', 'Asa Noturna', 'Lucius Fox'];

socket.on('connect', () => {
  const sessionStorageNickname = sessionStorage.getItem('nickname');
  const nameRandom = listNameRandom[Math.round(Math.random() * 13)];
  socket.id = {
    id: socket.id,
    nickname: sessionStorageNickname || nameRandom,
    idPrivateRecipient: '',
  };
  sessionStorage.setItem('nickname', socket.id.nickname);
  socket.emit('dateUser', socket.id);
});

function editNickname() {
  const nicknameSaveBtn = document.querySelector('.nicknameSaveBtn');
  const inputNickname = document.querySelector('.nickname');
  nicknameSaveBtn.addEventListener('click', () => {
    sessionStorage.setItem('nickname', inputNickname.value);
    socket.id.nickname = inputNickname.value;
    inputNickname.value = '';
    socket.emit('dataUserEdit', socket.id);
  });
}

editNickname();

function emitMessage() {
  const inputChatMessage = document.querySelector('.chatMessage');
  const chatMessageBtn = document.querySelector('.chatMessageBtn');
  let data;
  chatMessageBtn.addEventListener('click', () => {
    data = {
      chatMessage: inputChatMessage.value,
      nickname: socket.id.nickname,
      idPrivateRecipient: socket.id.idPrivateRecipient,
    };
    socket.emit('message', data);
    inputChatMessage.value = '';
  });
}

emitMessage();

function createItensList(data, list, dataTestid, liClass, button) {
  const li = document.createElement('li');
  li.classList.add(liClass);
  const pMessage = document.createElement('p');
  pMessage.setAttribute('data-testid', dataTestid);
  pMessage.textContent = data.nickname || data;
  li.appendChild(pMessage);
  if (button) {
    const btnPrivate = document.createElement('button');
    btnPrivate.textContent = 'Privado';
    btnPrivate.classList.add('btn-private');
    li.appendChild(btnPrivate);
    btnPrivate.value = data.id;
    btnPrivate.addEventListener('click', (e) => {
      socket.id.idPrivateRecipient = e.target.value;
    });
  }
  list.appendChild(li);
}

function returnPublicChat() {
  const btnPublic = document.querySelector('.btn-public');
  btnPublic.addEventListener('click', () => {
    socket.id.idPrivateRecipient = '';
  });
}

returnPublicChat();

const listMessages = document.getElementById('listMessages');

socket.on('message', (message) => {
  createItensList(message, listMessages, 'message', 'li-messages');
});

const listUsers = document.getElementById('listUsers');

socket.on('listNamesConverted', (listNamesConverted) => {
  const userSession = listNamesConverted.filter((user) => user.id === socket.id.id);
  const othersUsers = listNamesConverted.filter((user) => user.id !== socket.id.id);
  listUsers.innerText = '';
  createItensList(userSession[0], listUsers, 'online-user', 'li-user-session');
  othersUsers.forEach((user) => {
    createItensList(user, listUsers, 'online-user', 'li-users', true);
  });
});

socket.on('dataServerPrivate', (message) => {
  createItensList(message, listMessages, 'message', 'li-messages');
});
