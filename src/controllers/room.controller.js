import Responses from '../utils/responses';

class LobbyController {
    static createRoom = async (_, res) => {
      try {
        return Responses.normal(res, {});
      } catch (err) {
        return Responses.unknown(res);
      }
    }
}

export default LobbyController;
