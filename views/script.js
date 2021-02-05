
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