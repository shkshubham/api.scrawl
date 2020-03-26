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

    static roomDetail = async (req, res) => {
      try {
        const {roomCode} = req.params;
        if (!roomCode) {
          return Responses.error(res, 'Please provide roomCode');
        }
        const room = await RoomService.getRoomDetail(roomCode);
        if (room) {
          return Responses.normal(res, room);
        }
        return Responses.error(res, 'Please provide valid roomCode');
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static roomJoin = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, 'Please provide roomCode');
      }
      try {
        // const room = await RoomService.joinRoom(roomCode);
        // if (room) {
        //   return Responses.normal(res, room);
        // }
        return Responses.error(res, 'Please provide valid roomCode');
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
}

export default LobbyController;
