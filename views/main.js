const socket = window.io();
const inputMessage = document.querySelector('#mensagemInput');
const loggedUsers = document.querySelector('#logged-users');
const sendMessage = document.querySelector('#send-message');
const changeNick = document.querySelector('#change-nick');
const messagesUl = document.querySelector('#messages');
const nickInput = document.querySelector('#nickInput');

let nickname;
let userId;

const createMessage = (message) => {
  const li = document.createElement('li');
  li.innerText = message;
  li.setAttribute('data-testid', 'message');
  li.className = 'message-item';
  messagesUl.appendChild(li);
};

const showUsers = (id, nick) => {
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'online-user');
  li.setAttribute('id', id);
  li.innerText = nick;
  loggedUsers.appendChild(li);
};

sendMessage.addEventListener('click', (e) => {
  e.preventDefault();
  const chatMessage = document.querySelector('#mensagemInput').value;
  if (chatMessage !== '') {
    socket.emit('message', { nickname, chatMessage });
    inputMessage.value = '';
  }
});

changeNick.addEventListener('click', (e) => {
  e.preventDefault();
  nickname = nickInput.value;
  if (nickname !== '') {
    socket.emit('nickChange', nickname, userId);
    nickInput.placeholder = nickname;
    nickInput.value = '';
  }
});

socket.on('connected', (id, nick) => {
  userId = id;
  nickname = nick;
  nickInput.placeholder = nick;
});

socket.on('userConnected', (id, nick) => showUsers(id, nick));

socket.on('message', (msg) => {
  createMessage(msg);
});

socket.on('nickChange', (nick, id) => {
  const ulNick = document.getElementById(id);
  ulNick.innerText = nick;
});

socket.on('userQuit', (id) => {
  document.getElementById(id).remove();
});
