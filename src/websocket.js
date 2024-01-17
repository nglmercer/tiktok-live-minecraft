const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4567 });

wss.on('connection', (ws) => {
    console.log('Nueva conexión establecida.');

    ws.on('message', (message) => {
        console.log('Comando recibido:', message);

        // Aquí puedes procesar el comando recibido y realizar las acciones correspondientes

        // Por ejemplo, si el comando es '/say hello world', puedes enviar un mensaje de vuelta al cliente
        if (message === '/say hello world') {
            ws.send('Hola mundo!');
        }
    });

    ws.on('close', () => {
        console.log('Conexión cerrada.');
    });
});

console.log('Servidor WebSocket iniciado en el puerto 4567.');