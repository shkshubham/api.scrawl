import Queue from '../utils/queue';
import Socket from './socket.service';
import Cache from '../cache';
import Types from '../types/types';

class GameService {
  static async startGame(foundLobby) {
    await foundLobby.update({
      gameStarted: true,
    });
    const lobby = JSON.parse(JSON.stringify(foundLobby));
    lobby.users = [lobby.owner, ...lobby.users];
    delete lobby.owner;
    Socket.emit(foundLobby.lobbyCode, {
      type: Types.SOCKET_TYPES.GAME.STARTED,
      data: lobby,
    });
    Queue.gameQueue.add(foundLobby);
    return lobby;
  }

  static init = async () => {
    const cachedLobbyData = Cache.get('GAME_INIT');
    if (cachedLobbyData) {
      return cachedLobbyData;
    }

    // const lobbyData = await Database.GAME.findOne().lean();
    // const foundCategories = await Database.Category.find().select(['name', 'language']).lean();
    // const languageData = {};
    // for (const {language, name, _id} of foundCategories) {
    //   const foundKeyData = languageData[language];
    //   const newData = {
    //     name,
    //     _id,
    //   };
    //   if (foundKeyData) {
    //     languageData[language] = [
    //       ...foundKeyData,
    //       newData,
    //     ];
    //   } else {
    //     languageData[language] = [
    //       newData,
    //     ];
    //   }
    // }
    // const payload = {
    //   ...lobbyData,
    //   language: languageData,
    // };
    // Cache.set('LOBBY_INIT', payload);
    // return payload;
  }
}

export default GameService;
