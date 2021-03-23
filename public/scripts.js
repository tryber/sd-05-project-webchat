// Make connection
var socket = io('http://localhost:3000');

// Query DOM
const userMessage = document.getElementById('user-message');
const user = document.getElementById('user');
const btn = document.getElementById('send');
const chatBox = document.getElementById('chatBox');
const userTyping = document.getElementById('userTyping');

// Emit events
btn.addEventListener('click', function(){
  console.log('linha 13', userMessage.value);
  socket.emit('message', {
      chatMessage: userMessage.value,
      nickname: user.value
  });
  userMessage.value = "";
});

// message.addEventListener('keypress', function(){
//     socket.emit('typing', handle.value);
// })

// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
