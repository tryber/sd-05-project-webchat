// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files
window.onload = () => {
  const clientSocketIo = window.io('http://localhost:3000');

  const faker = require('faker');

  // 1. User click send message
  // See if nickname is default or one chosen by user
  let nicknameUsed = faker.name.firstName();
  const chosenNickname = document.getElementById('nickname-input').value;
  const nicknameBtn = document.getElementById('nickname-save');
  nicknameBtn.addEventListener('click', () => {
    nicknameUsed = chosenNickname.value;
  });

  const sendBtn = document.getElementById('send');
  sendBtn.addEventListener('click', () => {
    const chatMessage = document.getElementById('message-input').value;
    const emitMessage = {
      nickname: nicknameUsed,
      chatMessage,
    };
    clientSocketIo.emit('message', emitMessage);
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

  // clientSocketIo.on('newUser', (username) => {
  //   const divUsers = document.getElementById('users')
  //   const li = document.createElement('li')
  //     li.setAttribute('data-name', 'user-online')
  //   li.textContent = username;

  //   divUsers.append(li)
  // });

  // clientSocketIo.on('message', (message) => {
  //   const allMessages = document.getElementById('messages')
  //   console.log(allMessages)
  //   const p = document.createElement('p');
  //     p.textContent = message;

  //   allMessages.appendChild(p)
  // });
};
