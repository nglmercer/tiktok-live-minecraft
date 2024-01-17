import io from 'socket.io-client';

const key = 'change_me';
const options = {
    host: 'localhost',
    port: 4567,
    path: `/v1/ws/console?x-servertap-key=${key}`
};

const socket = io(`ws://${options.host}:${options.port}${options.path}`);

socket.on('connect', function() {
    console.log("Opened connection");
    socket.emit('command', '/say conectado'); // Enviar comando una vez conectado
});

socket.on('error', function(error) {
    console.log("WebSocket Error: ", error);
});

socket.on('disconnect', function() {
    console.log("WebSocket connection closed");
});