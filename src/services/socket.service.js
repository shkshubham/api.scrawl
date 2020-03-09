import { createServer } from 'http';
import socket from 'socket.io';
import Config from '../configs';

class Socket {
    static io;
    static client;
    static server;
    
    static init() {
        this.server = createServer()
        this.io = socket(this.server);
        this.io.on('connection', client => {
            this.client = client
            client.on('event', data => {
                console.log("Event")     
            });
            client.on('disconnect', () => {
                console.log("Disconnected")     
            });
        });
        this.startSocketServer()
    }

    static emit(eventName, data) {
        this.io.emit(eventName, data)
    }

    static startSocketServer() {
        this.server.listen(Config.SOCKET_PORT, () => {
            console.log({
                "Socket Server Started": true,
                "Port": Config.SOCKET_PORT
            })
        });
    }
}

export default Socket;