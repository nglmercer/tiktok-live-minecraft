import express from 'express';
import cors from 'cors';
import WebSocket from 'ws';
import fs from 'fs';
import pkg from 'faye-websocket';
const FayeClient = pkg.Client;
const key = 'change_me'; // replace with your key
import winston from 'winston';

let ws = null; // Define ws aquí.
let ws2 = null; // Define ws2 aquí
let reconnectInterval = null;
let reconnectInterval2 = null;
const MIN_RECONNECT_DELAY = 100;
const MAX_RECONNECT_DELAY = 20000;
let reconnectDelay = MIN_RECONNECT_DELAY;
const app = express();
const MAX_COMMAND_ATTEMPTS = 10; // Cambiar a la cantidad que desees
// Variables para almacenar los datos de los archivos
let keywords = null;
let commandList = null;
// Ahora puedes usar getNextPlayerName() para obtener el nombre del jugador que debes usar
const consoleTransport = new winston.transports.Console({
    format: winston.format.simple()
});
const logger = winston.createLogger({
    transports: [consoleTransport]
});
// Leer los archivos al inicio del script
fs.readFile('keywords.json', 'utf8', (err, data) => {
    if (err) throw err;
    keywords = JSON.parse(data);
});

fs.readFile('commandList.json', 'utf8', (err, data) => {
    if (err) throw err;
    commandList = JSON.parse(data);
});
// Middleware para permitir solicitudes CORS
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes POST como JSON
app.use(express.json());
app.get('/api/health', (req, res) => {
    res.json({ message: 'Servidor en funcionamiento' });
});
app.post('/api/receive', (req, res) => {
    const { eventType, data, msg, color, message } = req.body;
    if (!msg || !data) {
        res.status(400).json({ message: 'Faltan datos en la solicitud' });
        return;
    }

    switch (eventType) {
        case 'chat':
            handleChat(data, msg);
            break;
        case 'gift':
            handleGift(data, msg);
            break;
        case 'social':
            handleSocial(data, msg, color, message);
            break;
        case 'likes':
            handleLikes(data, msg);
            break;
        case 'streamEnd':
            handleStreamEnd(data, message);
            break;
        default:
            logger.info(`Evento desconocido: ${eventType}`);
    }

    res.json({ message: 'Datos recibidos' });
});
let commandQueue = [];
logger.info(commandQueue);

function connectWebSocket() {
    setTimeout(() => {
        const options = {
            host: 'localhost',
            port: 4567,
            path: '/v1/ws/console',
            headers: {
                'Cookie': `x-servertap-key=${key}`
            }
        };

        ws = new WebSocket(`ws://${options.host}:${options.port}${options.path}`, {
            headers: options.headers
        });
        ws.on('open', function open() {
            logger.info('Conectado al WebSocket');
            sendCommand(`/say Connected`);
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
                reconnectDelay = MIN_RECONNECT_DELAY;
            }
            processCommandQueue(); // Procesar la cola de comandos cuando se abre la conexión
        });

        ws.on('error', function error(err) {
            logger.info('Error al conectar al WebSocket', err);
            if (!reconnectInterval) {
                reconnectInterval = setInterval(connectWebSocket, reconnectDelay); // Reintentar después de un retraso
                // Aumentar el retraso para el próximo intento, hasta el límite máximo
                reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
            }
            sendNextCommand(); // Intentar enviar el próximo comando
        });

        ws.on('close', function close() {
            logger.info('Conexión al WebSocket cerrada');
            if (!reconnectInterval) {
                reconnectInterval = setInterval(connectWebSocket, reconnectDelay); // Reintentar después de un retraso
                // Aumentar el retraso para el próximo intento, hasta el límite máximo
                reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
            }
            sendNextCommand(); // Intentar enviar el próximo comando
        });
    }, 100); // Esperar 5 segundos antes de conectar
}


function connectWebSocket2() {
    const options = {
        host: 'localhost',
        port: 4567,
        path: '/v1/ws/console',
        headers: {
            'Cookie': `x-servertap-key=${key}`
        }
    };

    ws2 = new FayeClient(`ws://${options.host}:${options.port}${options.path}`, null, { headers: options.headers });

    ws2.on('open', function open() {
        logger.info('connected to websocket 2');
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
            reconnectDelay = MIN_RECONNECT_DELAY;
        }
    });

    ws2.on('error', function error(err) {
        logger.info('Error al conectar al WebSocket', err);
        if (!reconnectInterval) {
            reconnectInterval = setInterval(connectWebSocket2, reconnectDelay); // Reintentar después de un retraso
            // Aumentar el retraso para el próximo intento, hasta el límite máximo
            reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
        }
        sendNextCommand(); // Intentar enviar el próximo comando
    });
}

function handleChat(data, msg) {
    if (data && data.comment) {
        logger.info(`${data.uniqueId} : ${data.comment}`);
        // Aquí puedes manejar el evento de chat
        handleEvent('chat', data);
    }
}

function handleGift(data, msg) {
    if (data && data.giftName) {
        let repeatCount = data.repeatCount ? data.repeatCount : 1;
        logger.info(`${data.uniqueId} Gift: ${data.giftName}, Repetitions: ${repeatCount}`);

        handleEvent('gift', data, `${data.uniqueId}:${data.giftName}x${repeatCount} `);

    }
}
let lastEvent = null;

function handleSocial(data, msg, color, message) {
    if (data.displayType.includes('follow')) {
        if (lastEvent !== 'follow' || data.uniqueId !== lastEvent.uniqueId) {
            logger.info(`${data.uniqueId} te sige`);
            handleEvent('follow', data);
            lastEvent = { eventType: 'follow', uniqueId: data.uniqueId };
        }
    } else if (data.displayType.includes('share')) {
        logger.info(`${data.uniqueId} ha compartido`);
        handleEvent('share', data);
        // Aquí puedes manejar el evento de compartir
    }
}
let userStats = {};

function handleLikes(data, msg) {
    if (!userStats[msg.uniqueId]) {
        userStats[msg.uniqueId] = { likes: 0, totalLikes: 0, milestone: 50 };
    }

    handleEvent('likes', `${userStats[msg.uniqueId].milestone}likes`);
    logger.info(`Evento: ${userStats[msg.uniqueId].milestone}likes`);
    userStats[msg.uniqueId].milestone += 50; // Increase the milestone
    if (userStats[msg.uniqueId].milestone > 300) {
        userStats[msg.uniqueId].likes = 0; // Reset user's like count if it reaches 300
        userStats[msg.uniqueId].milestone = 50; // Reset the milestone
    }
}

function handleStreamEnd(data, message) {
    logger.info(`Evento de 'streamEnd': ${message}`);
    // Aquí puedes manejar el evento de 'streamEnd'
}

let giftCommandQueue = [];
let lastCommand = null;
let currentPlayerIndex = 0;
const playerNames = ["melser", "melser"];

function handleEvent(eventType, data, likes) {
    let playerName = null
    let eventCommands = [];
    if (playerNames[currentPlayerIndex] === undefined || playerNames[currentPlayerIndex].length < 2) {
        playerName = 'melser'; // Usa un nombre de jugador predeterminado si el actual no es válido
    } else {
        playerName = playerNames[currentPlayerIndex];
    }

    // Incrementa el contador y reinícialo si es necesario
    currentPlayerIndex++;
    if (currentPlayerIndex >= playerNames.length) {
        currentPlayerIndex = 0;
    }

    if (eventType === 'gift') {
        let giftName = data.giftName.trim().toLowerCase(); // Eliminar espacios en blanco y convertir a minúsculas
        let foundGift = Object.keys(commandList.gift).find(gift => gift.toLowerCase() === giftName); // Buscar el regalo en la lista de comandos
        if (foundGift) {
            eventCommands = commandList.gift[foundGift];
        } else {
            eventCommands = commandList.gift['default'];
        }
    } else if (commandList[eventType]) {
        if (typeof commandList[eventType] === 'object' && !Array.isArray(commandList[eventType])) {
            if (data.likes && commandList[eventType][data.likes]) {
                eventCommands = commandList[eventType][data.likes];
            } else {
                eventCommands = commandList[eventType]['default'];
            }
        } else {
            eventCommands = commandList[eventType];
        }
    }
    if (Array.isArray(eventCommands)) {
        eventCommands.forEach(command => {
            let replacedCommand = command.replace('{uniqueId}', data.uniqueId || '')
                .replace('{comment}', data.comment || '')
                .replace('{likes}', likes || '') // Replacing 'likes' with the number of likes
                .replace('{message}', data.comment || '')
                .replace('{giftName}', data.giftName || '')
                .replace('{repeatCount}', data.repeatCount || '')
                .replace('{playername}', playerName || '');
            if (eventType !== 'gift' && replacedCommand === lastCommand) {
                return; // Skip this command if it's the same as the last one and the event type is not 'gift'
            }
            // Ahora puedes usar `keywords.keywordToGive` y `keywords.keywordToMob` en lugar de `keywordToGive` y `keywordToMob`
            if (data.comment && keywords.keywordToGive[data.comment.toLowerCase()]) {
                let itemKeyword = Object.keys(keywords.keywordToGive).find(keyword => data.comment.toLowerCase().includes(keyword.toLowerCase()));
                if (itemKeyword) {
                    replacedCommand = `/execute at @a run give @a ${keywords.keywordToGive[itemKeyword]}`;
                    logger.info(replacedCommand);
                }
            } else if (command.includes('item')) {
                return;
            }

            if (data.comment && keywords.keywordToMob[data.comment.toLowerCase()]) {
                let mobKeyword = Object.keys(keywords.keywordToMob).find(keyword => data.comment.toLowerCase().includes(keyword.toLowerCase()));
                if (mobKeyword) {
                    replacedCommand = `/execute at ${playername} run summon ${keywords.keywordToMob[mobKeyword]}`;
                    logger.info(replacedCommand);
                }
            } else if (command.includes('mob')) {
                return;
            }
            let repeatCount = data.repeatCount || 1;
            for (let i = 0; i < repeatCount; i++) {
                if (eventType === 'gift') {
                    giftCommandQueue.push({ command: replacedCommand, attempt: 1 });
                } else if (replacedCommand !== lastCommand) {
                    lastCommand = replacedCommand;
                    commandQueue.push({ command: replacedCommand, attempt: 1 });
                }
            }
        });
    }
    sendNextCommand();
}

function processCommandQueue() {
    while (commandQueue.length > 0) {
        let commandObject = commandQueue.shift();
        if (commandObject && commandObject.command) {
            sendCommand(commandObject);
        }
    }
}
async function sendCommand(command, attempt = 1) {
    if (command === null) {
        logger.info(`comando erroneo`);
        return;
    }
    if (typeof command !== 'string') {
        command = String(command);
    }
    try {
        if (attempt <= 5) {
            if (ws2 && ws2.readyState === FayeClient.OPEN) {
                ws2.send(command);
            } else if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(command);
            } else {
                throw new Error('WebSocket no abierto');
            }
        }
    } catch (error) {
        if (attempt < MAX_COMMAND_ATTEMPTS) {
            setTimeout(() => {
                commandQueue.unshift({ command, attempt: attempt + 1 }); // Vuelve a poner el comando en la cola si hay un error
            }, 1000); // Espera 1 segundo antes de volver a poner el comando en la cola
        } else {
            logger.error(`Error en comando:${command} ${error}`);
            logger.info(`eliminado después de ${attempt} intentos: ${command}`);
        }
        if (attempt <= 5 && ws2 && !reconnectInterval2) {
            reconnectInterval2 = setInterval(connectWebSocket2, 9999); // Reintentar cada 5 segundos
        }
        if (attempt > 5 && ws && !reconnectInterval) {
            reconnectInterval = setInterval(connectWebSocket, 9999); // Reintentar cada 5 segundos
        }
    }
}

async function sendNextCommand() {
    while (giftCommandQueue.length > 0 || commandQueue.length > 0) {
        let commandObject = null;

        if (giftCommandQueue.length > 0) {
            commandObject = giftCommandQueue.shift();
        } else if (commandQueue.length > 0) {
            commandObject = commandQueue.shift();
        }

        if (commandObject && commandObject.command) {
            try {
                await sendCommand(commandObject.command, commandObject.attempt);
                lastCommand = commandObject.command;
            } catch (error) {
                logger.error('Error command:', error);
                break;
            }
        }
    }
}

connectWebSocket();
connectWebSocket2();
app.listen(3000, () => logger.info('Servidor escuchando en el puerto 3000'));