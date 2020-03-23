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
        if (foundKeyData) {
          languageData[language] = [
            ...foundKeyData,
            {
              name,
              _id,
            },
          ];
        } else {
          languageData[language] = [
            {
              name,
              _id,
            },
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
