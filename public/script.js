const inputMessage = document.getElementById('inputMessageInBox');
    const chatMessages = document.getElementById('messages');
    const inputNickname = document.getElementById('inputName');
    const onlineUsersList = document.getElementById('onlineUsers');
    const publicButton = document.getElementById('publicButton');
    const socket = io();
    const localHistory = {
      'public': [],
      'private': [],
    }
    let nickname;
    let addressee;
    let chatType = 'public';
    const addMessage = (message) => {
      const messageElement = document.createElement('p');
      messageElement.innerText = message;
      chatMessages.appendChild(messageElement);
    };
    inputMessage.addEventListener('submit', (event) => {
      event.preventDefault();
      const chatMessage = event.target.elements.message.value;
      socket.emit('message', { chatMessage, nickname, addressee });
      event.target.elements.message.value = '';
      event.target.elements.message.focus();
    });
    inputNickname.addEventListener('submit', (event) => {
      event.preventDefault();
      nickname = event.target.elements.nickname.value;
      socket.emit('updateNick', nickname);
    });
    const cleanHistoryChat = () => {
      while (chatMessages.firstChild) {
        chatMessages.removeChild(chatMessages.lastChild)
      }
    }
    publicButton.addEventListener('click', (_event) => {
      publicButton.disabled = true;
      cleanHistoryChat();
      chatType = 'public'
      addressee = '';
      localHistory.public.map(addMgs => addMessage(addMgs));
    })
    socket.on('connect', () => {
      if (!nickname) nickname = `Visitor_${socket.id}`;
      socket.emit('userConnection', nickname);
    })
    // socket.on('displayHistory', (history, type) => {
    //   let msg;
    //   if (type === 'public') {
    //     history.map(({ timestamp, nickname, message }) => {
    //       msg = `${timestamp} - ${nickname}: ${message}`;
    //       localHistory[type].push(msg);
    //       if (type === chatType) addMessage(msg);
    //     });
    //   } else {
    //     history.map(({ timestamp, nickname, message, addressee }) => {
    //       msg = `${timestamp} (private) - ${nickname}: ${message}`;
    //       localHistory[type].push(msg);
    //       if (type === chatType) addMessage(msg);
    //     });
    //   }
    // });
    socket.on('displayUsers', (users) => {
      onlineUsersList.innerHTML = '';
      Object.entries(users).map(([key, value]) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.innerText = `${value}`;
        li.appendChild(div);
        if (key !== socket.id) {
          const privateButton = document.createElement('button');
          privateButton.innerText = 'Private';
          privateButton.id = key;
          privateButton.setAttribute("data-testid", "private")
          privateButton.addEventListener('click', (event) => {
            cleanHistoryChat();
            publicButton.disabled = false;
            chatType = 'private'
            addressee = event.target.id;
            localHistory.private.map(addMgs => addMessage(addMgs));
          });
          li.appendChild(privateButton);
        }
        onlineUsersList.appendChild(li);
      });
    })
    socket.on('message', (message, type) => {
      localHistory[type].push(message);
      console.log(localHistory);
      if (type === chatType) addMessage(message);
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });