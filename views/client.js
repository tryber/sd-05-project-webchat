const socket = window.io('http://localhost:3000');

const botaoEnviar = document.querySelector('#enviar');
const inputMessage = document.querySelector('#mensagemInput');
const botaoAlteraNick = document.querySelector('#alteraNick');
const nickInput = document.querySelector('#nicknameInput');

let nicknameUsuario;
let idUsuario;

socket.on('usuario', (usuarioID, usuarioNickname) => {
  idUsuario = usuarioID;
  nicknameUsuario = usuarioNickname;
});

botaoEnviar.addEventListener('click', (e) => {
  e.preventDefault();
  socket.emit('message', {
    chatMessage: inputMessage.value,
    nickname: nicknameUsuario,
  });
  inputMessage.value = '';
});

botaoAlteraNick.addEventListener('click', (e) => {
  e.preventDefault();
  nicknameUsuario = nickInput.value;
  nickInput.value = '';

  const li = document.getElementById(idUsuario);
  li.innerHTML = nicknameUsuario;
  socket.emit('nickChange', nicknameUsuario, idUsuario);
});

const createMessage = (mensagem) => {
  const messagesUl = document.querySelector('#mensagens');
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerText = mensagem;
  messagesUl.appendChild(li);
};
// Listenners
socket.on('ola', (mensagem) => createMessage(mensagem));
socket.on('message', (mensagem) => createMessage(mensagem));
socket.on('connection', (id, username) => {
  const usersUl = document.querySelector('#users');
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'online-user');
  li.setAttribute('id', id);
  li.innerText = username;
  usersUl.appendChild(li);
});

socket.on('nickChange', (user) => {
  const li = document.getElementById(user.id);
  li.innerHTML = user.nickname;
});

socket.on('userDisconnect', (id) => {
  const li = document.getElementById(id);
  li.remove();
});

window.onbeforeunload = () => {
  socket.close();
};
