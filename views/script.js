// const handleClick = (e) => {
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
