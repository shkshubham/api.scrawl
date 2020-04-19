import Responses from '../utils/responses';
import LobbyService from '../services/lobby.service';

class LobbyController {
  static MSG = {
    INVALID_LOBBY_CODE: 'Invalid Lobby',
    PROVIDE_LOBBY_CODE: 'Please provide roomCode',
  }
    static getLobbyDetails = async (_, res) => {
      try {
        const response = await LobbyService.getLobbyDetails();
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static listAllPublic = async (_, res) => {
      try {
        return Responses.normal(res, await LobbyService.getAllPublicRooms());
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static createLobby = async (req, res) => {
      try {
        const response = await LobbyService.createRoom(req);
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static lobbyDetail = async (req, res) => {
      try {
        const {roomCode} = req.params;
        if (!roomCode) {
          return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
        }
        const room = await LobbyService.getRoomDetail(roomCode);
        if (room) {
          return Responses.normal(res, room);
        }
        return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static lobbyJoin = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
      }
      try {
        const foundRoom = await LobbyService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
        }

        if (foundRoom.kickedUsers.includes(req.user._id)) {
          return Responses.error(res, 'You have been kicked from lobby. Can not join');
        }

        if (LobbyService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.normal(res, foundRoom, 'Room Joined');
        }
        const {room, message} = await LobbyService.roomJoin(req.user._id, foundRoom);
        return Responses.normal(res, room, message);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static leaveLobby = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
      }
      try {
        const foundRoom = await LobbyService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
        }
        const response = await LobbyService.leaveRoom(req.user._id, foundRoom);
        return Responses.normal(res, null, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static kickPlay = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
      }
      try {
        const foundRoom = await LobbyService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
        }
        if (!LobbyService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.error(res, 'You are not owner of lobby. Only owner can kick player');
        }
        const response = await LobbyService.kickPlay(req.body.userId, foundRoom);
        return Responses.normal(res, null, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static editLobby = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, LobbyController.MSG.PROVIDE_LOBBY_CODE);
      }
      try {
        const foundRoom = await LobbyService.findRoomByRoomCode(roomCode);
        if (!foundRoom) {
          return Responses.error(res, LobbyController.MSG.INVALID_LOBBY_CODE);
        }
        if (!LobbyService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.error(res, 'You are not owner of lobby. Only owner can edit lobby');
        }
        const {key, value} = req.body;
        LobbyService.editRoom(roomCode, {
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
