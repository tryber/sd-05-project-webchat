window.onload = () => {
  const clientSocketIo = window.io('http://localhost:3000');

  const element = (id) => document.getElementById(id);

  const status = element('status');
  const messages = element('messages');
  const textArea = element('textarea');
  const username = element('username');
  const clearBtn = element('clear');
  const sndBtn = element('sendBtn');

  // Set default status
  const statusDefault = status.textContent;

  const setStatus = (s) => {
    // Set status
    status.textContent = s;

    if (s !== statusDefault) {
      setTimeout(() => {
        setStatus(statusDefault);
      }, 4000);
    }
  };

  // Handle output
  if (clientSocketIo !== undefined) {
    console.log('Connected to socket...');
    // console.log(socket);
    clientSocketIo.on('history', (data) => {
      // console.log(data);
      if (data.length) {
        data.forEach((d) => {
          // build out message div
          console.log(d);
          const message = document.createElement('div');
          message.setAttribute('class', 'chat-message');
          message.textContent = `${d.data} ${d.hora} ${d.nickname}: ${d.chatMessage}`;
          messages.appendChild(message);
          messages.insertBefore(message, messages.firstChild);
        });
      }
    });

    clientSocketIo.on('message', ({ data, hora, nickname, chatMessage }) => {
      const message = document.createElement('div');
      message.setAttribute('class', 'chat-message');
      message.textContent = `${data} ${hora} ${nickname}: ${chatMessage}`;
      messages.appendChild(message);
      messages.insertBefore(message, messages.firstChild);
    });

    // Get status from server
    clientSocketIo.on('status', (data) => {
      // Get message status
      setStatus(typeof data === 'object' ? data.message : data);

      // If status is clear, clear text

      if (data.clear) {
        textArea.value = '';
      }
    });

    // Handle input
    sndBtn.addEventListener('click', () => {
      // Emit to server input
      clientSocketIo.emit('message', {
        nickname: username.value,
        chatMessage: textArea.value,
      });
    });

    // Handle chat clear
    clearBtn.addEventListener('click', () => {
      clientSocketIo.emit('clear');
    });

    // Clear message
    clientSocketIo.on('cleared', () => {
      messages.textContent = '';
    });
  }
};
