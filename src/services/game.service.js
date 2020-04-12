import Queue from '../utils/queue';
import Socket from './socket.service';

class GameService {
  static async startGame(foundRoom) {
    await foundRoom.update({
      gameStarted: true,
    });
    const room = JSON.parse(JSON.stringify(foundRoom));
    room.users = [room.owner, ...room.users];
    delete room.owner;
    Socket.emit(foundRoom.roomCode, {
      type: 'GAME_STARTED',
      data: room,
    });
    Queue.gameQueue.add(foundRoom);
    return room;
  }
}

export default GameService;
