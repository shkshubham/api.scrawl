import Responses from '../utils/responses';
import LobbyService from '../services/lobby.service';

class LobbyController {
    static getLobbyDetails = async (_, res) => {
      try {
        const response = await LobbyService.getLobbyDetails();
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
}


export default LobbyController;
