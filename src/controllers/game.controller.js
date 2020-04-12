import Responses from '../utils/responses';
import GameService from '../services/game.service';
import RoomService from '../services/room.service';
import EventHandler from '../utils/EventHandler';

class GameController {
    static startGame = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, 'Please provide roomCode');
      }
      try {
        const foundRoom = await RoomService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, 'Please provide valid roomCode');
        }

        if (!RoomService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.error(res, 'You are not owner of lobby. Only owner can kick player');
        }
        const response = await GameService.startGame(foundRoom);
        return Responses.normal(res, response, 'Game Started');
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static selectWord = async (req, res) => {
      const {roomCode, word} = req.body;
      try {
        EventHandler.eventEmitter.emit(`SERVER_LOBBY_CHOOSE_WORD_${req.user._id}_${roomCode}`, word);
        return Responses.normal(res, true);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
}


export default GameController;
