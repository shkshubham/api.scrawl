import {createServer} from 'http';
import socket from 'socket.io';
import Config from '../configs';
import Logger from '../utils/logger';

class Socket {
    static io;
    static client;
    static server;

    static init() {
      this.server = createServer();
      this.io = socket(this.server);
      this.io.on('connection', (client) => {
        Logger.log('table', {
          'CONTECTED': client.id,
        });
        this.client = client;

        client.on('disconnect', () => {
          Logger.log('table', {
            Disconnected: true,
          });
        });
        client.on('DRAW', (data) => {
          Logger.log('log', data);
          this.io.emit('DRAWING', data);
        });
      });
      this.startSocketServer();
    }

    static emit(eventName, data) {
      this.io.emit(eventName, data);
    }

    static startSocketServer() {
      this.server.listen(Config.SOCKET_PORT, () => {
        Logger.log('table', {
          'Socket Server Started': true,
          'Port': Config.SOCKET_PORT,
        });
      });
    }
}

export default Socket;
