const socket = window.io('http://localhost:3000');

const listNameRandom = ['Bane', 'Bruce Wayne', 'Batman', 'Alfred', 'Robin', 'Coringa', 'Espantalho', 'Batgirl', 'Hera Venenosa', 'Mulher-Gato', 'Ras al Ghul', 'Asa Noturna', 'Lucius Fox'];

socket.on('connect', () => {
  const sessionStorageNickname = sessionStorage.getItem('nickname');
  const nameRandom = listNameRandom[Math.round(Math.random() * 13)];
  socket.id = {
    id: socket.id,
    nickname: sessionStorageNickname || nameRandom,
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
    };
    socket.emit('message', data);
    inputChatMessage.value = '';
  });
}

emitMessage();

const listMessages = document.getElementById('listMessages');

socket.on('message', (message) => {
  const li = document.createElement('li');
  li.classList.add('li-message');
  const pMessage = document.createElement('p');
  pMessage.setAttribute('data-testid', 'message');
  pMessage.textContent = message;
  li.appendChild(pMessage);
  listMessages.appendChild(li);
});

const listUsers = document.getElementById('listUsers');

socket.on('newUser', (newUser) => {
  if (newUser.id === socket.id.id) {
    const userSession = document.querySelector('.p-user-session');
    userSession.innerText = newUser.nickname;
    userSession.setAttribute('id', newUser.id);
  } else {
    const li = document.createElement('li');
    const pMessage = document.createElement('p');
    pMessage.setAttribute('data-testid', 'online-user');
    pMessage.setAttribute('id', newUser.id);
    pMessage.classList.add('p-user');
    pMessage.textContent = newUser.nickname;
    li.appendChild(pMessage);
    listUsers.appendChild(li);
  }
});

socket.on('dataUserEdited', (dataUser) => {
  if (dataUser.id === socket.id.id) {
    const userSession = document.querySelector('.p-user-session');
    userSession.innerText = dataUser.nickname;
  } else {
    document.querySelectorAll('.p-user').forEach((user) => {
      if (user.getAttribute('id') === dataUser.id) {
        const textUser = user;
        textUser.textContent = dataUser.nickname;
      }
    });
  }
});

socket.on('userDisconnect', (userId) => {
  document.querySelectorAll('.p-user').forEach((user) => {
    if (user.getAttribute('id') === userId) {
      user.parentNode.remove();
    }
  });
});

window.onbeforeunload = () => {
  socket.close();
};
