/* const messageSocketIo = window.io();

document.getElementById('buttonMensagens').addEventListener('click', async () => {
  const nicknameDoc = document.querySelector('#users');
  const chatMessageDoc = document.querySelector('#mensagemInput');
  const timestamp = moment(new Date().getTime()).format('DD-MM-yyyy hh:mm:ss');
  const nickname = nicknameDoc.innerHTML;
  console.log(nickname);
  const chatMessage = chatMessageDoc.value;
  console.log(chatMessage);
  if (chatMessage) {
    messageSocketIo.emit('message', { nickname, chatMessage });
    chatMessageDoc.value = '';
  }
  const messageUl = document.querySelector('#mensagens');
  const li = document.createElement('li');
  li.setAttribute('data-testid', chatMessage);
  li.innerText = `${timestamp} - ${nickname}: ${chatMessage}`;
  messageUl.appendChild(li);
}); */
