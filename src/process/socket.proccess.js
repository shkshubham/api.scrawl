import Database from '../database';
import Logger from '../utils/logger';
import Socket from '../services/socket.service';
import Types from '../types/types';

class SocketProcess {
  static async processClientOnConnected({clientId, userId}) {
    const user = await Database.User.findOne({
      _id: userId,
    }).populate('country').select(['name', 'picture', 'looking']);
    if (user) {
      Logger.normal('Connected', user._id);
      if (user.looking) {
        Socket.emit(Types.SOCKET_TYPES.LOOKING.PLAYERS_JOINED, user);
      }
      await user.update({
        socketId: clientId,
      });
    }
  }

  static async processClientOnDisconnected(socketId) {
    const user = await Database.User.findOne({
      socketId,
    });
    if (user) {
      Logger.normal('Disconnected', user._id);
      Socket.emit(Types.SOCKET_TYPES.LOOKING.PLAYERS_LEAVED, user);
      await user.update({
        socketId: null,
      });
    }
  }
}

export default SocketProcess;
