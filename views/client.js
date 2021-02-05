// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files
window.onload = () => {
  const clientSocketIo = window.io();

  // 1. User click send message

  // See if nickname is default or one chosen by user
  // `User${Math.round(Math.random() * 1000)}`
  let nickname = '';
  const chosenNickname = document.getElementById('nickname-input').value;
  const nicknameBtn = document.getElementById('nickname-save');
  nicknameBtn.addEventListener('click', () => {
    nickname = chosenNickname;
  });
  // this part above is actually totally ignored because from another scope
  
  const sendBtn = document.getElementById('send');
  sendBtn.addEventListener('click', () => {
    const chatMessage = document.getElementById('message-input').value;
    const nickname = document.getElementById('nickname-input').value;
    clientSocketIo.emit('message', { chatMessage, nickname });
    // does not send anything, i think because nickname is from another scope
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
