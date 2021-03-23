window.onload = () => {
  const clientSocketIo = window.io();

  // Input e Botão do Nickname
  const inputNickname = document.querySelector('.inputNickname');
  const btnNickname = document.querySelector('.btnNickname');

  // Input e Botão de Messagem
  const inputMessage = document.querySelector('.inputMessage');
  const btnMessage = document.querySelector('.btnMessage');

  // Lista de usuários
  const ulUsuarioOnline = document.querySelector('.ulUsuarioOnline');

  // Container de mensagens
  const messages = document.querySelector('.messages');

  let clientId = '';
  let nickname = '';

  btnNickname.addEventListener('click', () => {
    nickname = inputNickname.value;
    clientSocketIo.emit('changeNickname', nickname);
    inputNickname.value = '';
  });

  clientSocketIo.on('changeNickname', ({ nickname, socketId }) => {
    const userNickname = document.getElementById(socketId);
    userNickname.innerHTML = nickname;
  });

  // Aguardando evento no click do botao enviar mensagem e capturando value de input
  btnMessage.addEventListener('click', () => {
    if (inputMessage.value.length > 0) {
      const chatMessage = inputMessage.value;
      clientSocketIo.emit('messageServer', { nickname, chatMessage });
      inputMessage.value = '';
    }
  });

  clientSocketIo.on('messageMain', (receivedMessage) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'message');
    li.textContent = receivedMessage;
    messages.appendChild(li);
  });

  // eventos do socket conectando cliente e servidor
  clientSocketIo.on('connected', ({ sessionUserId, convidadoNick }) => {
    clientId = sessionUserId;
    nickname = convidadoNick;
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.setAttribute('id', `${clientId}`);
    li.innerHTML = nickname;
    ulUsuarioOnline.appendChild(li);
  });
};
