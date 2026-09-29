const messages = document.querySelector('.messages');
const input = document.querySelector('#message');

function send(content) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble sent';
  bubble.append(content);
  const time = document.createElement('time');
  time.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date());
  bubble.append(time);
  messages.append(bubble);
  bubble.scrollIntoView({ block: 'nearest' });
}

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  send(document.createTextNode(input.value.trim()));
  input.value = '';
});

document.querySelector('#attachment').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const image = document.createElement('img');
  image.alt = file.name;
  image.src = URL.createObjectURL(file);
  image.onload = () => URL.revokeObjectURL(image.src);
  send(image);
  event.target.value = '';
});
