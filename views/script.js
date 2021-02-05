const socket = window.io('http://localhost:3000');

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
// const handleClick = (e) => {
  // const socket = io(); //'http://localhost:3000'
  
  let userName = `Usuário ${Date.now()}`;
  const nameBtn = document.getElementById('btn-name');
  
  nameBtn.addEventListener('click', () => {
    userName = document.getElementById('nickNameInput').value;
    // alert(`nome ${userName} salvo`);
    document.getElementById('nickNameInput').value = '';
  });
  
  const message = document.getElementById('inputMessage');
  const messageBtn = document.getElementById('send-button');
  const messages = document.getElementById('messageList');
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
      const chatMessage = message.value

      socket.emit('message', { chatMessage, nickname  });
      // console.log(`${userName} ${message.value}`);
      message.value = '';
    }
  });
  
//   e.preventDefault();
//   const socket = io();
//   socket.emit('mensagem', { newMsg: e.inputMessage.value, nickname: e.nickNameInput.value});
// };

// const socket = io();

// document.querySelector('form').addEventListener('submit', (e) =>{
//   e.preventDefault();
//   socket.emit('mensagem', { newMsg: e.inputMessage.value, nickname: e.nickNameInput.value});
//   return false;
// });

// //addEventListener('click', handleClick);

//       const form = document.querySelector('form')
//       const inputMessage = document.querySelector('#mensagemInput')
//       form.addEventListener('submit', (e) =>{
//         e.preventDefault();
//         socket.emit('mensagem', inputMessage.value);
//         inputMessage.value = ''
//         return false;
//       });
// Quando nosso evento `ola` for emitido,
// vamos pegar a string mensagem enviada pelo nosso evento e passar para a função `createMessage`
// socket.on('ola', (mensagem) => createMessage(mensagem));

// <style>
//       * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//       }
//       body {
//         font: 13px Helvetica, Arial;
//       }
//       form {
//         background: #000;
//         padding: 3px;
//         position: fixed;
//         bottom: 0;
//         width: 100%;
//       }
//       form input {
//         border: 0;
//         padding: 10px;
//         width: 90%;
//         margin-right: 0.5%;
//       }
//       form button {
//         width: 9%;
//         background: rgb(130, 224, 255);
//         border: none;
//         padding: 10px;
//         cursor: pointer;
//       }
//       #mensagens {
//         list-style-type: none;
//         margin: 0;
//         padding: 0;
//       }
//       #mensagens li {
//         padding: 5px 10px;
//       }
//       #mensagens li:nth-child(odd) {
//         background: #eee;
//       }
//     </style>
