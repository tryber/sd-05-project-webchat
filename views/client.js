const { userSocketIdMap } = require('../tests/helpers/userSocketIDMap');

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
      }, 4000);
    }
  };

  console.log(clientSocketIo);
  // console.log(clientSocketIo.sessionid);
  clientSocketIo.on('connect', (something) => {
    console.log(something)
  })

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

  clientSocketIo.on('history', (data) => {
    if (data.length) {
      data.forEach((d) => {
        // console.log(d);
        const message = document.createElement('div');
        message.setAttribute('data-testid', 'message');
        message.textContent = `${d.data} ${d.hora} ${d.nickname}: ${d.chatMessage}`;
        messageList.appendChild(message);
        messageList.insertBefore(message, messageList.firstChild);
      });
    }
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

  clientSocketIo.on('newUser', ({ fakename, clientID }) => {
    username.value = fakename;
    // https://www.javascripttutorial.net/es6/javascript-map/#:~:text=To%20get%20the%20keys%20of,of%20elements%20in%20the%20map.
    const connectedUsers = [...userSocketIdMap.keys()];

    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.textContent = fakename;

    users.append(li);
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