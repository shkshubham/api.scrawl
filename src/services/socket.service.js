import socket from 'socket.io';
import Logger from '../utils/logger';

class Socket {
    static io;
    static client;
    static init(server) {
      this.io = socket(server);
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
    }

    static emit(eventName, data) {
      this.io.emit(eventName, data);
    }
}

export default Socket;
