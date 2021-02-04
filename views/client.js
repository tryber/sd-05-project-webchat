// Client side, where to manipulate the DOM
// Reference: https://github.com/tryber/sd-04-live-lectures/pull/67/files 
window.onload = () => {
  const clientSocketIo = window.io('http://localhost:3000');

  clientSocketIo.on('message', (fullMessage) => {
    const divMessages = document.getElementById('messages')
    const li = document.createElement('li')
      li.setAttribute('data-tested', 'message')
    li.textContent = fullMessage;
    // li.innerHTML = fullMessage;
    divMessages.append(li)
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

  // document.getElementById('send').addEventListener('click', () => {
  //   const message = document.getElementById('message').value;
  //   const name = document.querySelectorAll('li[data-name="user-online"]')[0].innerText;
  //   clientSocketIo.emit('message', { name, message });
  // });

}
