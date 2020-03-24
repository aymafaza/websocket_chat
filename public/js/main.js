const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// Get username and room from URL
const username = prompt("Please enter your name", "Anonymous");
const channel = prompt("Please enter channel to join", "General");

const socket = io();

var socket = io.connect();
console.log("check 1", socket.connected);
socket.on("connect", function() {
  console.log("check 2", socket.connected);
});

// Join chatroom
socket.emit("joinChannel", { username, channel });

// Get room and users
socket.on("roomUsers", ({ channel, users }) => {
  outputChannelName(channel);
  outputUsers(users);
});

// Message from server
socket.on("message", message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("message", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputChannelName(channel) {
  roomName.innerText = channel;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
  `;
}
