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
      categoryId: '5e78f803125a036cb368fbc4',
      owner: {
        user: user._id,
      },
    });
    return room;
  }

  static getRoomDetail = async (roomCode) => {
    const userFields = ['name', 'picture', 'email'];
    return await Database.Room.findOne({roomCode}).populate('owner.user', userFields).populate('users.user', userFields) || null;
  }

  static findRoomByRoomCode = async (roomCode) => {
    return await Database.Room.findOne({
      roomCode,
    });
  }

  static roomJoin = async (userId, room) => {
    let isImMemberOfRoom = null;

    if (room.users.length) {
      isImMemberOfRoom = room.users.find((userData) => userData.user._id.toString() === userId);
    }
    if (isImMemberOfRoom) {
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
}

export default RoomService;
