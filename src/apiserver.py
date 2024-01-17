from flask import Flask, jsonify, request
from websocket import create_connection, WebSocketApp

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'message': 'Servidor en funcionamiento'})

@app.route('/api/receive', methods=['POST'])
def receive():
    data = request.get_json()
    eventType = data.get('eventType')
    msg = data.get('msg')
    color = data.get('color')
    message = data.get('message')

    if not msg or not data:
        return jsonify({'message': 'Faltan datos en la solicitud'}), 400

    if eventType == 'chat':
        handle_chat(data, msg)
    elif eventType == 'gift':
        handle_gift(data, msg)
    elif eventType == 'social':
        handle_social(data, msg, color, message)
    elif eventType == 'likes':
        handle_likes(data, msg)
    elif eventType == 'streamEnd':
        handle_stream_end(data, message)
    else:
        print(f'Evento desconocido: {eventType}')

    return jsonify({'message': 'Datos recibidos'})

def connect_websocketApp():
    ws = WebSocketApp('ws://localhost:4567/v1/ws/console',
                      on_open=on_open,
                      on_error=on_error,
                      on_close=on_close)

    ws.run_forever()

def on_open(ws):
    print('Connected to websocketApp')
    send_command(ws, '/say Connected')

def on_error(ws, error):
    print('Failed to connect to websocketApp:', error)

def on_close(ws):
    print('websocketApp connection closed')

def send_command(ws, command):
    # Implement the code to send commands
    pass
def handle_chat(data, msg):
    # Implement the logic to handle the chat event
    pass

def handle_gift(data, msg):
    # Implement the logic to handle the gift event
    pass

def handle_social(data, msg, color, message):
    # Implement the logic to handle the social event
    pass

def handle_likes(data, msg):
    # Implement the logic to handle the likes event
    pass

def handle_stream_end(data, message):
    # Implement the logic to handle the stream end event
    pass

if __name__ == '__main__':
    connect_websocketApp()
    app.run(port=3000)

