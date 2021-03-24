window.onload = () => {
  const clientSocketIo = window.io();

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
