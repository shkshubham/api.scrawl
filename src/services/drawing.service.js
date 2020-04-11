import Socket from './socket.service';
const word = 'CYCLE';

class Drawing {
  static processComments(roomCode, data) {
    const {message} = data;
    if (message.length) {
      if (message.includes(word)) {
        data.message = 'Guessed the word';
      } else {
        data.message = message[0];
      }
    } else {
      data.message = '';
    }
    Socket.emit(roomCode, data);
  }

  static processWords() {

  }
}

export default Drawing;
