import io from 'socket.io';

const connection = require('./tests/helpers/db');

const messageForm = document.querySelector('#messageBox');
const nicknameForm = document.querySelector('#nicknameBox');
const inputMessage = document.querySelector('#mensagemInput');
const socket = io();

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('mensagem', inputMessage.value);
  inputMessage.value = '';
  return false;
});

const createMessage = (message) => {
  const messagesUl = document.querySelector('#mensagens');
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerText = message;
  messagesUl.appendChild(li);
};

socket.on('ola', (mensagem) => createMessage(mensagem));
socket.on('mensagemServer', ({ mensagem }) => createMessage(mensagem));

nicknameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nickname = e.target.value;
  await connection().collection('messages').insertOne({ message: 'test', nickname });
});
