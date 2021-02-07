const socket = window.io('http://localhost:3000');

const message = document.getElementById('inputMessage');
const messageBtn = document.getElementById('send-button');
const messages = document.getElementById('messageList');

const createMessage = (insertChat) => {
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerHTML = insertChat;
  messages.appendChild(li);
};

socket.on('message', (msg) => createMessage(msg));
// window.onload = () => {
//   socket.on('message', (msg) => createMessage(msg));
// };

const userNickname = document.getElementById('userNickname');
const insertNick = (nickname) => {
  userNickname.innerHTML = nickname;
};

socket.on('nickname', (Nick) => insertNick(Nick))

const users = document.getElementById('onlineUsers');

const insertUser = (user, id) => {
  const li = document.createElement('li');
  li.setAttribute('id', id);
  li.setAttribute('data-testid', 'online-user');
  li.innerHTML = user;
  users.appendChild(li);
};

socket.on('onlineUsers', (id, Nick) => insertUser(Nick, id));

const changeUser = (id, username) => {
  const li = document.getElementById(id);
  li.innerHTML = username;
};

socket.on('newNickname', (ID, userName) => changeUser(ID, userName));

const removeUser = (id) => {
  const li = document.getElementById(id);
  li.remove();
};

socket.on('disconnectedUser', (id) => removeUser(id));

let userName = userNickname.innerHTML;
const nameBtn = document.getElementById('btn-name');

nameBtn.addEventListener('click', () => {
  userName = document.getElementById('nickNameInput').value;
  insertNick(userName);
  // alert(`nome ${userName} salvo`);
  socket.emit('nicknamechange', userName);
  document.getElementById('nickNameInput').value = '';
});
// const time = new Date().toUTCString();
// const now = new Date();
// const date = dateFormat(now, 'dd-mm-yyyy');
// const time = dateFormat(now, 'HH:mm:ss');

messageBtn.addEventListener('click', () => {
  if (message.value.length) {
    // const li = document.createElement('li');
    // li.setAttribute('data-testid', 'message');
    // li.innerHTML = `${date} ${time} - ${userName}: ${message.value}`
    // messages.appendChild(li);
    const nickname = userName;
    const chatMessage = message.value;
    socket.emit('message', { chatMessage, nickname });
    // console.log(`${userName} ${message.value}`);
    message.value = '';
  }
});
