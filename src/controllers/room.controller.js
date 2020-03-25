import Responses from '../utils/responses';
import RoomService from '../services/room.service';

class LobbyController {
    static createRoom = async (req, res) => {
      try {
        const response = await RoomService.createRoom(req);
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
}

export default LobbyController;
