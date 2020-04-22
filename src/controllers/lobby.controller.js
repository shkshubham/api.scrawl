import Responses from '../utils/responses';
import LobbyService from '../services/lobby.service';

class LobbyController {
  static MSG = {
    INVALID_LOBBY_CODE: 'Invalid Lobby',
    PROVIDE_LOBBY_CODE: 'Please provide lobbyCode',
  }

  static listAllPublic = async (_, res) => {
    try {
      return Responses.normal(res, await LobbyService.getAllPublicLobbies());
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static createLobby = async (req, res) => {
    try {
      const response = await LobbyService.createLobby(req);
      return Responses.normal(res, response);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static lobbyDetail = async (req, res) => {
    try {
      const {lobbyCode} = req.params;
      if (!lobbyCode) {
        return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
      }
      const lobby = await LobbyService.getLobbyDetail(lobbyCode);
      if (lobby) {
        return Responses.normal(res, lobby);
      }
      return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
  static lobbyJoin = async (req, res) => {
    const {lobbyCode} = req.params;
    if (!lobbyCode) {
      return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
    }
    try {
      const foundLobby = await LobbyService.getLobbyDetail(lobbyCode);
      if (!foundLobby) {
        return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
      }

      if (foundLobby.kickedUsers.includes(req.user._id)) {
        return Responses.error(res, 'You have been kicked from lobby. Can not join');
      }

      if (LobbyService.findIsLobbyOwner(foundLobby, req.user._id)) {
        return Responses.normal(res, foundLobby, 'Lobby Joined');
      }
      const {lobby, message} = await LobbyService.joinLobby(req.user._id, foundLobby);
      return Responses.normal(res, lobby, message);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static leaveLobby = async (req, res) => {
    const {lobbyCode} = req.params;
    if (!lobbyCode) {
      return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
    }
    try {
      const foundLobby = await LobbyService.getLobbyDetail(lobbyCode);
      if (!foundLobby) {
        return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
      }
      const response = await LobbyService.leaveLobby(req.user._id, foundLobby);
      return Responses.normal(res, null, response);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
  static kickPlayer = async (req, res) => {
    const {lobbyCode} = req.params;
    if (!lobbyCode) {
      return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
    }
    try {
      const foundLobby = await LobbyService.getLobbyDetail(lobbyCode);
      if (!foundLobby) {
        return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
      }
      if (!LobbyService.findIsLobbyOwner(foundLobby, req.user._id)) {
        return Responses.error(res, 'You are not owner of lobby. Only owner can kick player');
      }
      const response = await LobbyService.kickPlayer(req.body.userId, foundLobby);
      return Responses.normal(res, null, response);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static editLobby = async (req, res) => {
    const {lobbyCode} = req.params;
    if (!lobbyCode) {
      return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
    }
    try {
      const foundLobby = await LobbyService.findLobbyByLobbyCode(lobbyCode);
      if (!foundLobby) {
        return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
      }
      if (!LobbyService.findIsLobbyOwner(foundLobby, req.user._id)) {
        return Responses.error(res, 'You are not owner of lobby. Only owner can edit lobby');
      }
      const {key, value} = req.body;
      LobbyService.editLobby(lobbyCode, {
        key,
        value,
      });
      return Responses.normal(res, null);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
}


export default LobbyController;
