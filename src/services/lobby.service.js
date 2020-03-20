import Database from '../database';
import {rounds, hindi, english, drawTime} from '../data/lobby';
import Cache from '../cache';
class LobbyService {
    static getLobbyDetails = async () => {
      const cachedLobbyData = Cache.get('lobby');
      if (cachedLobbyData) {
        return cachedLobbyData;
      }
      const lobbyData = await Database.Lobby.findOne().lean();
      if (!lobbyData) {
        return await Database.Lobby.create({
          rounds,
          drawTime,
          language: {
            hindi,
            english,
          },
        });
      }
      return lobbyData;
    }
}

export default LobbyService;
