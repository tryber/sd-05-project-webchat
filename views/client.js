const clientSocketIo = window.io('http://localhost:3000');

// window.onload = () => {

const element = (id) => document.getElementById(id);

const messageList = element('messageList');
const textArea = element('textarea');
const username = element('username');
const clearBtn = element('clear');
const sndBtn = element('btn-send');
const users = element('users');
const saveBTN = element('btn-save');

sndBtn.addEventListener('click', () => {
  clientSocketIo.emit('message', {
    nickname: username.value,
    chatMessage: textArea.value,
  });
});

clientSocketIo.on('message', (completeMessage) => {
  const message = document.createElement('div');
  message.setAttribute('data-testid', 'message');
  message.textContent = completeMessage;
  messageList.appendChild(message);
  messageList.insertBefore(message, messageList.firstChild);
});

// ///////////////////////////////////////////
clientSocketIo.on('newUser', ({ fakename }) => {
  username.value = fakename;

  const li = document.createElement('li');
  li.setAttribute('data-testid', 'online-user');
  li.setAttribute('id', fakename);

  li.textContent = fakename;

  users.prepend(li);

  clientSocketIo.emit('newUserArrived', { userThatArrived: fakename });
});
// ///////////////////////////////////////////
clientSocketIo.on('putNewUserOnYourList', ({ userThatArrived }) => {
  const isThereAnElementWithThisNameId = element(userThatArrived);

  if (!isThereAnElementWithThisNameId) {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', userThatArrived);
    li.textContent = userThatArrived;

    users.append(li);
  }
});
// ///////////////////////////////////////////

clientSocketIo.on('atualizaUsers', ({ usersMap2, oldNameToDelete }) => {
  const firstNameOfTheList = users.firstChild.textContent;

  users.innerHTML = '';

  let li = document.createElement('li');
  li.setAttribute('data-testid', 'online-user');
  li.setAttribute('id', firstNameOfTheList);

  li.textContent = firstNameOfTheList;

  users.append(li);

  const usersMapWithouHero = usersMap2.filter(
    (user) => user.name !== firstNameOfTheList,
  );

  usersMapWithouHero.forEach((user) => {
    li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', user.name);
    li.textContent = user.name;

    users.append(li);
  });

  const userToRemoveFromList = element(oldNameToDelete);
  if (userToRemoveFromList) {
    element.parentNode.removeChild(userToRemoveFromList);
  }
});

saveBTN.addEventListener('click', () => {
  clientSocketIo.emit('changeNick', username.value);
});

// Não são importantes para o projeto
clientSocketIo.on('userLeft', ({ fakename }) => {
  const message = document.createElement('div');
  message.setAttribute('class', 'userLeft');
  message.textContent = `${fakename} left...`;
  messageList.appendChild(message);
  messageList.insertBefore(message, messageList.firstChild);

  const nameToBeRemoved = element(fakename);
  if (nameToBeRemoved) nameToBeRemoved.remove();
});

clearBtn.addEventListener('click', () => {
  clientSocketIo.emit('clear');
});

clientSocketIo.on('cleared', () => {
  messageList.textContent = '';
});
// };

window.onbeforeunload = () => {
  clientSocketIo.close();
};
