import { io } from '/socket.io/socket.io.esm.min.js';

const joinScreen = document.getElementById('join-screen');
const joinForm = document.getElementById('join-form');
const nicknameInput = document.getElementById('nickname-input');
const roomInput = document.getElementById('room-input');

const chatScreen = document.getElementById('chat-screen');
const roomLabel = document.getElementById('room-label');
const nicknameLabel = document.getElementById('nickname-label');
const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const socket = io();

let nickname = '';
let room = '';

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();

  nickname = nicknameInput.value.trim();
  room = roomInput.value.trim();
  if (!nickname || !room) return;

  socket.emit('join room', { nickname, room });

  roomLabel.textContent = room;
  nicknameLabel.textContent = nickname;
  joinScreen.hidden = true;
  chatScreen.hidden = false;
  messageInput.focus();
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('chat message', text);
  messageInput.value = '';
});

socket.on('chat message', ({ nickname: from, text, system }) => {
  const item = document.createElement('li');

  if (system) {
    item.textContent = text;
    item.classList.add('system');
  } else {
    item.textContent = `${from} says "${text}"`;
    if (from === nickname) item.classList.add('own');
  }

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
