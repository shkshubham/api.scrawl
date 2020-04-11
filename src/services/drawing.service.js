import Socket from './socket.service';

class Drawing {
  static processComments(roomCode, data) {
    Socket.emit(roomCode, data);
  }

  static processWords() {

  }
}

export default Drawing;
