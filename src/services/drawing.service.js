import Socket from './socket.service';
const word = 'cycle';

class Drawing {
  static types = {
    LOBBY_CHAT: 'LOBBY_CHAT',
    LOBBY_PLAYER_GUESSED_WORD: 'LOBBY_PLAYER_GUESSED_WORD',
  }

  static processComments(roomCode, data) {
    Drawing.checkAndSetWord(roomCode, data);
    Socket.emit(roomCode, {
      type: Drawing.types.LOBBY_CHAT,
      data,
    });
  }

  static checkAndSetWord(roomCode, data) {
    const {message} = data;
    if (message.length) {
      if (message.includes(word)) {
        Socket.emit(roomCode, {
          type: Drawing.types.LOBBY_PLAYER_GUESSED_WORD,
          data: data.user.userId,
        });
        data.message = 'Guessed the word';
      } else {
        data.message = message[0];
      }
    } else {
      data.message = '';
    }
  }

  static processWords() {

  }
}

export default Drawing;


// 42["lobbyReveal",{"reason":"TP","word":"lake","scores":[527,1140,537,2250,546,890,551,940,555,1830,565,650,567,0,568,0]}]
// 42["chat",{"id":527,"message":"lake"}]
// 42["lobbyChooseWord",{"id":555}]
// 42["lobbyPlayerDrawing",555]
// 42["lobbyCurrentWord","_____"]
// 42["lobbyPlayerDrawing",551]

// 42["lobbyReveal",{"reason":"TP","word":"short","scores":[527,1140,537,2700,546,890,551,940,555,2000,565,885,567,0,568,0]}]
// 42["lobbyChooseWord",{"id":551}]
// 42["lobbyPlayerDrawing",551]
// 42["lobbyCurrentWord","_______"]
// 42["canvasClear"]
// 42["lobbyCurrentWord","___f___ _____"]
// 42["lobbyPlayerGuessedWord",565]
// 42["lobbyTime",31]
