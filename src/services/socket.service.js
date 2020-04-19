import socket from 'socket.io';
import Logger from '../utils/logger';
import LobbyService from './lobby.service';
import EventHandler from '../utils/EventHandler';

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
        client.on('ROOM_CLIENT_EDIT', (data) => {
          Logger.log('table', {
            'ROOM_CLIENT_EDIT': data,
          });
          LobbyService.processRoomEdit(data);
        });
        client.on('disconnect', () => {
          Logger.log('table', {
            Disconnected: true,
          });
        });

        client.on('CLIENT_DRAWING_TOUCH', ({roomCode, data}) => {
          console.log('p----------touch----', data);
          EventHandler.eventEmitter.emit(roomCode, {
            type: 'CLIENT_DRAWING_TOUCH',
            data,
          });
        });
        client.on('CLIENT_DRAWING_RELEASE', ({roomCode, data}) => {
          console.log('p----------relase----', data);
          EventHandler.eventEmitter.emit(roomCode, {
            type: 'CLIENT_DRAWING_RELEASE',
            data,
          });
        });

        client.on('CLIENT_CLEAR_CLEAR', ({roomCode, data}) => {
          EventHandler.eventEmitter.emit(roomCode, {
            type: 'CLIENT_CLEAR_CLEAR',
            data,
          });
        });

        client.on('CLIENT_CHAT', ({roomCode, data}) => {
          EventHandler.eventEmitter.emit(roomCode, {
            type: 'CLIENT_CHAT',
            data,
          });
        });
      });
    }

    static emit(eventName, data) {
      console.log('Socket: ', eventName, JSON.stringify(data));
      this.io.emit(eventName, data);
    }
}

export default Socket;
