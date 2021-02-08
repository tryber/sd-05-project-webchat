const messageList = async (message) => {
  const messageUl = document.querySelector('#mensagens');
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerText = message;
  messageUl.appendChild(li);
};

module.exports = messageList;
