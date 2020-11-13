const path = require('path');
const http = require('http');
const fs = require('fs');

const express = require('express');
const socketIo = require('socket.io');
const ss = require('socket.io-stream');
const moment = require('moment');
const cron = require('node-cron');
const shell = require('shelljs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 5000 || process.env.PORT;
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	socket.on('user-joined', (username) => {
		msg = {
			username: username,
			type: 'user-joined'
		}
		io.emit('add-message', msg);
	});

	socket.on('new-message', (msg) => {
		msg['time'] = moment().format('h:mm a');
		io.emit('add-message', msg);
	});

	socket.on('image-message', (file) => {
		file['time'] = moment().format('h:mm a');
		io.emit('add-message', file)
	});
	
	ss(socket).on('file-message', (stream, data) => {
		let myPath = 'data/' + data.name;
		let filename = path.join(__dirname, 'public', myPath);
		stream.pipe(fs.createWriteStream(filename));
		data['type'] = "file";
		data['path'] = myPath;
		data['time'] = moment().format('h:mm a');
		io.emit('add-message', data)
	});

	socket.on('disconnect', (socket) => {
		console.log('1 user disconnected!');
	});
});

server.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});

cron.schedule(`0 0 0 * * *`, () => {
	if(shell.exec(`node cron-job.js`).code) {
		console.log("Something went wrong!");
	}
});