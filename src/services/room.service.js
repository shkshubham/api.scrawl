import Database from '../database';
import Utils from '../utils';
import {drawTime, rounds} from '../data/lobby';
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

  static findOnRoom = (room) => {
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
    const {isMemeber} = RoomService.findOnRoom(room);

    if (isMemeber) {
      return {
        room,
        message: 'Room Joined',
      };
    }

    room.users = room.users.concat({
      user: userId,
    });

    await room.save();
    return {
      room: await RoomService.getRoomDetail(room.roomCode),
      message: 'Room Joined',
    };
  }

  static findIsRoomOwner = (room, userId) => {
    return room.owner.user._id.toString() === userId;
  }

  static leaveRoom = async (userId, room) => {
    const {isMemeber, index} = RoomService.findOnRoom(room);
    if (!isMemeber) {
      const isOwner = RoomService.findIsRoomOwner(room, userId);
      if (isOwner) {
        if (room.users.length) {
          const userData = JSON.parse(JSON.stringify(room.users[0]));
          room.users = room.users.splice(0, 1);
          room.owner = {
            user: userData.user._id,
            score: userData.user.score,
          };
          await room.save();
        } else {
          await room.delete();
          return 'Room Deleted';
        }
      }
      return 'You can not the member of the room';
    }
    room.users = room.users.splice(index, 1);
    await room.save();
    return 'Leaved Room';
  }
}

export default RoomService;
