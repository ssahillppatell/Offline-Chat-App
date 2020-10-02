const socket = io();

let params = new window.URLSearchParams(window.location.search);
const username = params.get('username');
const newMessage = document.getElementById('newMessage');
const attachFile = document.getElementById('attachFile');

socket.on('connect', () => {
	console.log("Connected!");
	socket.emit('user-joined', username);
});

socket.on('add-message', (msg) => {
	addMessage(msg);
});

const addMessage = (msg) => {
	let newElement = document.createElement('div');
	newElement.classList.add('message');

	if(msg.type == "text") {
		newElement.innerHTML=`
			<span>${msg.username} ${msg.time}</span><br>
			<span>${msg.text}</span>
		`;
	} else if(msg.type == 'image') {
		newElement.innerHTML = `
			<span>${msg.username} ${msg.time}</span><br>
			<img src = "${msg.data}" />
		`
		newElement.src = msg.data;
	}
	document.querySelector('.chat').appendChild(newElement);
};

newMessage.addEventListener('submit', (e) => {
	e.preventDefault();
	const msg = {
		username: username,
		type: 'text',
		text: e.target.elements.message.value
	}
	socket.emit('new-message', msg);
	newMessage.reset();
});

attachFile.addEventListener('submit', (e) => {
	e.preventDefault();
	const file = e.target.elements.file.files[0];
	const fileReader = new FileReader();
	fileReader.readAsDataURL(file);
	fileReader.onload = () => {
		socket.emit('file-message', {
			username: username,
			type: 'image',
			data: fileReader.result
		});
	};
	attachFile.reset();
});