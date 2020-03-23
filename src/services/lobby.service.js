import Database from '../database';
import Cache from '../cache';
class LobbyService {
    static getLobbyDetails = async () => {
      const cachedLobbyData = Cache.get('lobby');
      if (cachedLobbyData) {
        return cachedLobbyData;
      }

      const lobbyData = await Database.Lobby.findOne().lean();
      const foundCategories = await Database.Category.find().select(['name', 'language']).lean();
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
      const payload = {
        ...lobbyData,
        language: languageData,
      };
      Cache.set('lobby', payload);
      return payload;
    }
}

export default LobbyService;
