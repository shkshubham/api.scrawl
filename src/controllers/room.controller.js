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
        const foundRoom = await RoomService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, 'Please provide valid roomCode');
        }

        if (foundRoom.kickedUsers.includes(req.user._id)) {
          return Responses.error(res, 'You have been kicked from lobby. Can not join');
        }

        if (RoomService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.normal(res, foundRoom, 'Room Joined');
        }
        const {room, message} = await RoomService.roomJoin(req.user._id, foundRoom);
        return Responses.normal(res, room, message);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static leaveRoom = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, 'Please provide roomCode');
      }
      try {
        const foundRoom = await RoomService.getRoomDetail(roomCode);
        if (!foundRoom) {
          return Responses.error(res, 'Please provide valid roomCode');
        }
        const response = await RoomService.leaveRoom(req.user._id, foundRoom);
        return Responses.normal(res, null, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }
    static kickPlay = async (req, res) => {
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
        const response = await RoomService.kickPlay(req.body.userId, foundRoom);
        return Responses.normal(res, null, response);
      } catch (err) {
        return Responses.unknown(res, err);
      }
    }

    static editRoom = async (req, res) => {
      const {roomCode} = req.params;
      if (!roomCode) {
        return Responses.error(res, 'Please provide roomCode');
      }
      try {
        const foundRoom = await RoomService.findRoom(roomCode);
        if (!foundRoom) {
          return Responses.error(res, 'Please provide valid roomCode');
        }
        if (!RoomService.findIsRoomOwner(foundRoom, req.user._id)) {
          return Responses.error(res, 'You are not owner of lobby. Only owner can edit lobby');
        }
        const {key, value} = req.body;
        RoomService.editRoom(roomCode, {
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
