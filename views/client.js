const clientSocketIo = window.io();

const createUser = async () => {
  const inputUser = document.querySelector('#userInput');
  const inputUserValue = inputUser.value;
  await clientSocketIo.emit('nickname', inputUserValue);
  inputUser.value = '';
};
document.getElementById('buttonUsuário').addEventListener('click', createUser);

clientSocketIo.on('nickname', (nickname) => { document.getElementById('users').innerHTML = nickname; });
