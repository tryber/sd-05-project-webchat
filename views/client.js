window.onload = () => {
  const clientSocketIo = window.io('http://localhost:3000');

  const element = (id) => document.getElementById(id);

  const status = element('status');
  const messageList = element('messageList');
  const textArea = element('textarea');
  const username = element('username');
  const clearBtn = element('clear');
  const sndBtn = element('btn-send');
  const users = element('users');
  const saveBTN = element('btn-save');

  const statusDefault = status.textContent;

  const setStatus = (s) => {
    status.textContent = s;

    if (s !== statusDefault) {
      setTimeout(() => {
        setStatus(statusDefault);
      }, 5000);
    }
  };

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

  clientSocketIo.on('status', (data) => {
    setStatus(typeof data === 'object' ? data.message : data);
    if (data.clear) {
      textArea.value = '';
    }
  });
  // ///////////////////////////////////////////
  clientSocketIo.on('newUser', ({ fakename, usersMap }) => {
    username.value = fakename;
    // users.innerHTML = '';

    // const createLI = (username) => {
    // }
    // Coloca nos usuarios online primeiro o próprio usuário
    let li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', fakename);

    li.textContent = fakename;

    users.prepend(li);

    // Tira o próprio usuário ;

    // const usersMapWithouHero = usersMap.filter(
    //   (user) => user.name !== fakename,
    // );

    // // renderiza o restante
    // usersMapWithouHero.forEach((user) => {
    //   li = document.createElement('li');
    //   li.setAttribute('data-testid', 'online-user');
    //   li.setAttribute('id', user.name);
    //   li.textContent = user.name;

    //   users.append(li);
    // });
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
    element.parentNode.removeChild(userToRemoveFromList);
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

    // const nameToBeRemoved = element(fakename);
    // console.log(nameToBeRemoved);
    // nameToBeRemoved.remove();
  });

  clearBtn.addEventListener('click', () => {
    clientSocketIo.emit('clear');
  });

  clientSocketIo.on('cleared', () => {
    messageList.textContent = '';
  });
};
