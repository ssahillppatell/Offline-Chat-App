const socket = io();

let params = new window.URLSearchParams(window.location.search);
const username = params.get('username');
const newMessage = document.getElementById('newMessage');
const attachImage = document.getElementById('attachImage');
const attachFile = document.getElementById('attachFile');

let progress = 0;
const spanClass = () => {
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

socket.on('connect', () => {
	console.log("Connected!");
	socket.emit('user-joined', username);
});

socket.on('add-message', (msg) => {
	addMessage(msg);
	progress = 0;
});

const sentOrReceived = () => {
	if(progress == 0 || progress == 100) {
		return "Received";
	} else {
		return progress;
	}
}

const addMessage = (msg) => {
	let newElement = document.createElement('div');
	newElement.classList.add('message');

	if(msg.type == "text") {
		newElement.innerHTML=`
		<span><b>${msg.username} <small>${msg.time}</small></b></span><br>
			<span>${msg.text}</span>
		`;
	} else if(msg.type == 'image') {
		newElement.innerHTML = `
			<span><b>${msg.username} <small>${msg.time}</small></b></span><br>
			<img src = "${msg.data}" />
		`;
	} else if(msg.type == 'file') {
		newElement.innerHTML=`
		<span><b>${msg.username} <small>${msg.time}</small></b></span><br>
			<span class = ${msg.id}>${sentOrReceived()}</span>
			<a href="${msg.path}" download>${msg.name}</a>
		`;
	} else if('user-joined') {
		newElement.innerHTML=`
			<span><b>${msg.username} Joined</b></span>
		`;
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

attachImage.addEventListener('submit', (e) => {
	e.preventDefault();
	let image = e.target.elements.image.files[0];
	const fileReader = new FileReader();
	fileReader.readAsDataURL(image);
	fileReader.onload = () => {
		socket.emit('image-message', {
			username: username,
			type: 'image',
			data: fileReader.result
		});
	};
	attachImage.reset();
});

attachFile.addEventListener('submit', (e) => {
	e.preventDefault();

	progress = 0;
	let file = e.target.elements.file.files[0];
	let stream = ss.createStream();
	let spanId = spanClass();

    ss(socket).emit('file-message', stream, {
		username: username,
		name: file.name,
		size: file.size,
		id: spanId
	});

	let blobStream = ss.createBlobReadStream(file);
	let size = 0;

	blobStream.on('data', (chunk) => {
		size += chunk.length;
		progress = Math.floor(size / file.size * 100);
		document.querySelector(`.${spanId}`).innerText = `${progress}%`
	});

	blobStream.pipe(stream);
	progress = 0;
	attachFile.reset();
});