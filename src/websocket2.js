const key = 'change_me';

function sendCommand(command) {
    const ws = new WebSocket('ws://localhost:4567/v1/ws/console', {
        headers: {
            'Cookie': `x-servertap-key=${key}`
        }
    });

    ws.onopen = function open() {
        console.log('Conexión WebSocket abierta. Enviando comando...');
        ws.send(command);
    };

    ws.onerror = function error(err) {
        console.error('WebSocket Error: ', err);
    };

    ws.onmessage = function message(event) {
        console.log('Respuesta del servidor:', event.data);
    };

    ws.onclose = function close() {
        console.log('WebSocket cerrado.');
    };
}

sendCommand('/say hello world');