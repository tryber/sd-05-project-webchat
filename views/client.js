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

  // Como fazer a lógica de salvar nickname?

  // const saveBTN = element('btn-save');

  const statusDefault = status.textContent;

  const setStatus = (s) => {
    status.textContent = s;

    if (s !== statusDefault) {
      setTimeout(() => {
        setStatus(statusDefault);
      }, 5000);
    }
  };

  // console.log(clientSocketIo.sessionid);

  // clientSocketIo.on('newNickName', (nickname) => {
  //   console.log({ nickname });
  //   username.value = nickname;
  // });

  sndBtn.addEventListener('click', () => {
    clientSocketIo.emit('message', {
      nickname: username.value,
      chatMessage: textArea.value,
    });
  });

  // clientSocketIo.on('history', (data) => {
  //   if (data.length) {
  //     data.forEach((d) => {
  //       // console.log(d);
  //       const message = document.createElement('div');
  //       message.setAttribute('data-testid', 'message');
  //       message.textContent = `${d.data} ${d.hora} ${d.nickname}: ${d.chatMessage}`;
  //       messageList.appendChild(message);
  //       messageList.insertBefore(message, messageList.firstChild);
  //     });
  //   }
  // });

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

  clientSocketIo.on('newUser', ({ fakename, usersMap }) => {
    username.value = fakename;
    users.innerHTML = '';

    // const createLI = (username) => {
    // }
    // Coloca nos usuarios online primeiro o próprio usuário
    let li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.textContent = fakename;

    users.append(li);

    // Tira o próprio usuário ;

    const usersMapWithouHero = usersMap.filter((user) => user.name !== fakename);

    // renderiza o restante
    usersMapWithouHero.forEach((user) => {
      li = document.createElement('li');
      li.setAttribute('data-testid', 'online-user');
      li.setAttribute('id', user.name);
      li.textContent = user.name;

      users.append(li);
    });
  });

  clientSocketIo.on('userLeft', ({ fakename, clienteId }) => {
    const message = document.createElement('div');
    message.setAttribute('class', 'userLeft');
    message.textContent = `${fakename} left...`;
    messageList.appendChild(message);
    messageList.insertBefore(message, messageList.firstChild);

    // TODO

    // Remover LI que contenha a ID com o nome

    const userToRemoveFromList = element(fakename);
    element.parentNode.removeChild(userToRemoveFromList);
  });

  clearBtn.addEventListener('click', () => {
    clientSocketIo.emit('clear');
  });

  clientSocketIo.on('cleared', () => {
    messageList.textContent = '';
  });
};

// TODO

// value="<%= fakename %>"

// <% if (fakename) { %>
//   <li data-testid="online-user"">
//     <%= fakename %>
//   </li>
// <% } %>
