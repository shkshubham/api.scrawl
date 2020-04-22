import Responses from '../utils/responses';
import GameService from '../services/game.service';
import LobbyService from '../services/lobby.service';
import EventHandler from '../utils/EventHandler';

class GameController {
  static startGame = async (req, res) => {
    const {lobbyCode} = req.params;
    if (!lobbyCode) {
      return Responses.error(res, 'Please provide lobbyCode');
    }
    try {
      const foundLobby = await LobbyService.getLobbyDetail(lobbyCode);
      if (!foundLobby) {
        return Responses.error(res, 'Invalid Lobby');
      }

      if (!LobbyService.findIsLobbyOwner(foundLobby, req.user._id)) {
        return Responses.error(res, 'You are not owner of lobby. Only owner can kick player');
      }
      const response = await GameService.startGame(foundLobby);
      return Responses.normal(res, response, 'Game Started');
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
  static selectWord = async (req, res) => {
    const {lobbyCode, word} = req.body;
    try {
      EventHandler.eventEmitter.emit(`SERVER_LOBBY_CHOOSE_WORD_${req.user._id}_${lobbyCode}`, word);
      return Responses.normal(res, true);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static init = async (req, res) => {
    try {
      const response = await GameService.init();
      return Responses.normal(res, response);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
}


export default GameController;
