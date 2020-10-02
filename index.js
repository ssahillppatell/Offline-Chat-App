const path = require('path');
const http = require('http');

const express = require('express');
const socketIo = require('socket.io');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8080 || process.env.PORT;
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	socket.on('user-joined', (username) => {
		console.log(`${username} Joined`);
	});

	socket.on('new-message', (msg) => {
		msg['time'] = moment().format('h:mm a');
		io.emit('add-message', msg);
	});

	socket.on('file-message', (file) => {
		file['time'] = moment().format('h:mm a');
		io.emit('add-message', file)
	})

	socket.on('disconnect', (socket) => {
		console.log("User Disconnected");
	});
});

server.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});