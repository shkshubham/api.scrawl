import socket from 'socket.io';
import Logger from '../utils/logger';
import LobbyService from './lobby.service';
import EventHandler from '../utils/EventHandler';
import Types from '../types/types';
import SocketProcess from '../process/socket.proccess';

class Socket {
    static io;
    static client;
    static init(server) {
      this.io = socket(server);
      this.io.on('connection', (client) => {
        Logger.log('table', {
          'CONTECTED': client.id,
        });
        client.on(Types.SOCKET_TYPES.LOBBY.EDIT.CLIENT, (data) => {
          LobbyService.processLobbyEdit(data);
        });
        client.on('disconnect', () => {
          SocketProcess.processClientOnDisconnected(client.id);
          Logger.log('table', {
            Disconnected: true,
            data: client.id,
          });
        });

        client.on(Types.SOCKET_TYPES.DRAWING.TOUCH.CLIENT, ({lobbyCode, data}) => {
          EventHandler.eventEmitter.emit(lobbyCode, {
            type: Types.EVENT_EMITTER_TYPES.DRAWING.TOUCH,
            data,
          });
        });
        client.on(Types.SOCKET_TYPES.DRAWING.RELEASE.CLIENT, ({lobbyCode, data}) => {
          EventHandler.eventEmitter.emit(lobbyCode, {
            type: Types.EVENT_EMITTER_TYPES.DRAWING.RELEASE,
            data,
          });
        });

        client.on(Types.SOCKET_TYPES.DRAWING.CLEAR.CLIENT, ({lobbyCode, data}) => {
          EventHandler.eventEmitter.emit(lobbyCode, {
            type: Types.EVENT_EMITTER_TYPES.DRAWING.CLEAR,
            data,
          });
        });

        client.on(Types.SOCKET_TYPES.CHAT.CHAT.CLIENT, ({lobbyCode, data}) => {
          EventHandler.eventEmitter.emit(lobbyCode, {
            type: Types.EVENT_EMITTER_TYPES.CHAT.CHAT,
            data,
          });
        });

        client.on(Types.SOCKET_TYPES.USER.SOCKET_CONNECTED.CLIENT, (data) => {
          SocketProcess.processClientOnConnected(data);
        });
      });
    }

    static emitDrawing(eventName, data) {
      this.io.emit(eventName, data);
    }
    
    static emit(eventName, data) {
      console.log('Socket: ', eventName, JSON.stringify(data));
      this.io.emit(eventName, data);
    }

    static getOnlineUsers = () => {
      const clients = Socket.io.sockets.clients().connected;
      const sockets = Object.values(clients);
      const users = sockets.map((s) => s.user);
      return users.filter((u) => u != undefined);
    };
}

export default Socket;
