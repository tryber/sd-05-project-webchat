const onlineSocketIo = window.io();

/* const createUser = async () => { */
setTimeout( async () => {  
  let users = {}; 
  const onlineUserDoc = document.getElementById('users');
  const onlineUser = await onlineUserDoc.innerHTML;
  console.log(onlineUser);
  users[onlineSocketIo.id] = onlineUser;
  console.log(users);
  onlineSocketIo.emit('nicknameOnline', users);
  inputUser.value = '';
  clientSocketIo.on('nicknameOnline', (users) => { document.getElementById('onlineUser').innerHTML = users; });
}, 100);
/* };
document.getElementById('buttonUsuário').addEventListener('click', createUser);  */



/*   setTimeout( async () => {  
    const onlineUserDoc = document.getElementById('users');
    console.log(onlineUserDoc);
    console.log(onlineUserDoc.innerHTML);
    const onlineUser = await onlineUserDoc.innerHTML;
    onlineSocketIo.emit('nicknameOnline', onlineUser);
    onlineSocketIo.on('nicknameOnline', (nickname) => {
      console.log(nickname);
      const onlinesUl = document.querySelector('#onlineUser');
      const li = document.createElement('li');
      li.innerHTML = nickname;
      onlinesUl.appendChild(li);
    });
  }, 100) */
