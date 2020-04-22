import Queue from '../utils/queue';
import Socket from './socket.service';
import Cache from '../cache';
import Types from '../types/types';
import Database from '../database';

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
    const payload = {
      types: Types.SOCKET_TYPES,
    };
    const gameData = await Database.Game.findOne().select(['rounds', 'drawTime', 'colors']).lean();
    payload.gameData = gameData;
    const foundCategories = await Database.Category.find().select(['name', 'language']);
    const languageData = {};
    for (const {language, name, _id} of foundCategories) {
      const foundKeyData = languageData[language];
      const newData = {
        name,
        _id,
      };
      if (foundKeyData) {
        languageData[language] = [
          ...foundKeyData,
          newData,
        ];
      } else {
        languageData[language] = [
          newData,
        ];
      }
    }
    payload.gameData.language = languageData;
    // Cache.set('LOBBY_INIT', payload);
    return payload;
  }
}

export default GameService;
