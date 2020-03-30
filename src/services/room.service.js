import Database from '../database';
import Utils from '../utils';
import {drawTime, rounds} from '../data/lobby';
import Socket from './socket.service';
class RoomService {
  static createRoom = async (req) => {
    const {user} = req;
    const roomCode = Utils.generateRandomString();
    const room = await Database.Room.create({
      roomCode,
      drawTime: drawTime[2],
      rounds: rounds[2],
      category: '5e78f803125a036cb368fbc4',
      owner: {
        user: user._id,
      },
    });
    return room;
  }

  static getRoomDetail = async (roomCode) => {
    const userFields = ['name', 'picture', 'email'];
    const categoryFields = ['name', 'language'];
    return await Database.Room.findOne({roomCode}).populate('owner.user', userFields).populate('users.user', userFields).populate('category', categoryFields) || null;
  }

  static findRoomByRoomCode = async (roomCode) => {
    return await Database.Room.findOne({
      roomCode,
    });
  }

  static findOnRoom = (room, userId) => {
    const payload = {
      isMemeber: false,
      index: -1,
    };
    if (!room.users.length) {
      return payload;
    }
    const foundIndex = room.users.findIndex((userData) => userData.user._id.toString() === userId);
    if (foundIndex > -1) {
      payload.isMemeber = true;
      payload.index = foundIndex;
      return payload;
    }
    return payload;
  }

  static roomJoin = async (userId, room) => {
    const {isMemeber} = RoomService.findOnRoom(room, userId);

    if (isMemeber) {
      Socket.emit(room.roomCode, {
        type: 'ROOM_JOINED_LEAVED',
        data: room.users,
      });
      return {
        room,
        message: 'Room Joined',
      };
    }

    room.users = room.users.concat({
      user: userId,
    });
    await room.save();
    const roomAfterUpdate = await RoomService.getRoomDetail(room.roomCode);
    Socket.emit(room.roomCode, {
      type: 'ROOM_JOINED_LEAVED',
      data: roomAfterUpdate.users,
    });
    return {
      room: roomAfterUpdate,
      message: 'Room Joined',
    };
  }

  static findIsRoomOwner = (room, userId) => {
    return room.owner.user._id.toString() === userId;
  }

  static leaveRoom = async (userId, room) => {
    const {isMemeber, index} = RoomService.findOnRoom(room, userId);
    if (!isMemeber) {
      const isOwner = RoomService.findIsRoomOwner(room, userId);
      if (isOwner) {
        if (room.users.length) {
          const userData = JSON.parse(JSON.stringify(room.users[0]));
          const data = {
            user: {
              _id: userData.user._id,
              score: userData.user.score,
              picture: userData.user.picture,
              name: userData.user.name,
            },
          };
          room.owner = {
            user: userData.user._id,
            score: userData.user.score,
          };
          room.users.splice(0, 1);
          Socket.emit(room.roomCode, {
            type: 'ROOM_OWNER',
            data,
          });
          Socket.emit(room.roomCode, {
            type: 'ROOM_JOINED_LEAVED',
            data: room.users,
          });
          await room.save();
          return 'Leaved Room';
        } else {
          await room.delete();
          return 'Room Deleted';
        }
      } else {
        return 'You can not the member of the room';
      }
    }
    room.users.splice(index, 1);
    Socket.emit(room.roomCode, {
      type: 'ROOM_JOINED_LEAVED',
      data: room.users,
    });
    await room.save();
    return 'Leaved Room';
  }

  static kickPlay = async (userId, room) => {
    const {isMemeber} = RoomService.findOnRoom(room, userId);
    if (!isMemeber) {
      return 'You can not kick play. Who is not in lobby';
    }
    const kickedPlay = room.users.splice(0, 1);
    Socket.emit(room.roomCode, {
      type: 'ROOM_JOINED_LEAVED',
      data: room.users,
    });
    Socket.emit(room.roomCode, {
      type: 'KICKED_PLAYER',
      data: kickedPlay[0].user._id,
    });
    await room.save();
    return 'Play Kicked';
  }
}

export default RoomService;
