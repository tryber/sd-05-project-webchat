// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files
window.onload = () => {
  const clientSocketIo = window.io();

  // 1. User click send message

  // See if nickname is default or one chosen by user
  // let nickname = '';
  let nickname = `User${Math.round(Math.random() * 1000)}`;
  const chosenNickname = document.getElementById('nickname-input');
  const nicknameBtn = document.getElementById('nickname-save');
  nicknameBtn.addEventListener('click', () => {
    nickname = chosenNickname.value;
  });

  const sendBtn = document.getElementById('send');
  sendBtn.addEventListener('click', () => {
    const chatMessage = document.getElementById('message-input').value;
    clientSocketIo.emit('message', { chatMessage, nickname });
  });

  // 3. Show the formatted message on the chat div
  clientSocketIo.on('message', (fullMessage) => {
    const divMessages = document.getElementById('messages');
    const li = document.createElement('li');
    li.setAttribute('data-tested', 'message');
    li.textContent = fullMessage;
    // li.innerHTML = fullMessage;
    divMessages.append(li);
  });
};
