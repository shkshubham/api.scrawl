import socket from 'socket.io';
import Logger from '../utils/logger';
import RoomService from './room.service';
import Drawing from './drawing.service';

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
          RoomService.processRoomEdit(data);
        });
        client.on('disconnect', () => {
          Logger.log('table', {
            Disconnected: true,
          });
        });
        client.on('CLIENT_DRAWING_TOUCH', (data) => {
          Logger.log('log', data);
          this.io.emit('SERVER_DRAWING_TOUCH', data);
        });
        client.on('CLIENT_DRAWING_RELEASE', (data) => {
          Logger.log('log', data);
          this.io.emit('SERVER_DRAWING_RELEASE', data);
        });
        client.on('CLIENT_COMMENTS', ({roomCode, data}) => {
          Drawing.processComments(roomCode, data);
        });
      });
    }

    static emit(eventName, data) {
      console.log('Socket: ', eventName, JSON.stringify(data));
      this.io.emit(eventName, data);
    }
}

export default Socket;
