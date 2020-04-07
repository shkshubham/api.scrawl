import Database from '../database';
import Utils from '../utils';
import {drawTime, rounds} from '../data/lobby';
import Socket from './socket.service';
class RoomService {
  static types = {
    ROOM_JOINED_LEAVED: 'ROOM_JOINED_LEAVED',
    KICKED_PLAYER: 'KICKED_PLAYER',
    ROOM_OWNER: 'ROOM_OWNER',
    ROOM_EDIT: 'ROOM_EDIT',
    NEW_LOBBY: 'NEW_LOBBY',
    EDIT_LOBBY_FOR_HOME: 'EDIT_LOBBY',
    DELETED_LOBBY: 'DELETED_LOBBY',
  }
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
    RoomService.onCreateLobbySocket(room);
    return room;
  }

  static getRoomDetail = async (roomCode) => {
    const userFields = ['name', 'picture', 'email'];
    const categoryFields = ['name', 'language'];
    return await Database.Room.findOne({roomCode}).populate('owner.user', userFields).populate('users.user', userFields).populate('category', categoryFields);
  }

  static findRoomByRoomCode = async (roomCode) => {
    return await Database.Room.findOne({
      roomCode,
    });
  }

  static getRoomWithOwnerDetail = async (roomCode) => {
    const userFields = ['name', 'picture'];
    return await Database.Room.findOne({roomCode}).populate('owner.user', userFields).lean();
  }

  static findOnRoom = (room, userId) => {
    const payload = {
      isMember: false,
      index: -1,
    };
    if (!room.users.length) {
      return payload;
    }
    const foundIndex = room.users.findIndex((userData) => userData.user._id.toString() === userId);
    if (foundIndex > -1) {
      payload.isMember = true;
      payload.index = foundIndex;
      return payload;
    }
    return payload;
  }

  static roomJoin = async (userId, room) => {
    const {isMember} = RoomService.findOnRoom(room, userId);

    if (isMember) {
      Socket.emit(room.roomCode, {
        type: RoomService.types.ROOM_JOINED_LEAVED,
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
    RoomService.onEditLobbySocket(room.roomCode, 'users', room.users.length);
    await room.save();
    const roomAfterUpdate = await RoomService.getRoomDetail(room.roomCode);
    Socket.emit(room.roomCode, {
      type: RoomService.types.ROOM_JOINED_LEAVED,
      data: roomAfterUpdate.users,
    });
    return {
      room: roomAfterUpdate,
      message: 'Room Joined',
    };
  }

  static onCreateLobbySocket = async (room) => {
    const filteredRoom = await RoomService.getPublicRoomDetail(room.roomCode);
    RoomService.sendNewRoomSocket(room.privacy, filteredRoom);
  }

  static onEditLobbySocket = async (roomCode, key, value) => {
    Socket.emit(RoomService.types.EDIT_LOBBY_FOR_HOME, {
      roomCode,
      data: {
        key,
        value,
      },
    });
  }

  static findIsRoomOwner = (room, userId) => {
    return room.owner.user._id.toString() === userId;
  }

  static leaveRoom = async (userId, room) => {
    const {isMember, index} = RoomService.findOnRoom(room, userId);
    if (!isMember) {
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
          RoomService.removeUserFromRoom(room, 0);
          Socket.emit(room.roomCode, {
            type: RoomService.types.ROOM_OWNER,
            data,
          });
          Socket.emit(room.roomCode, {
            type: RoomService.types.ROOM_JOINED_LEAVED,
            data: room.users,
          });
          RoomService.onEditLobbySocket(room.roomCode, 'users', room.users.length);
          await room.save();
          return 'Leaved Room';
        } else {
          Socket.emit(RoomService.types.DELETED_LOBBY, {
            roomCode: room.roomCode,
          });
          await room.delete();
          return 'Room Deleted';
        }
      } else {
        return 'You can not the member of the room';
      }
    }
    RoomService.removeUserFromRoom(room, index);
    Socket.emit(room.roomCode, {
      type: RoomService.types.ROOM_JOINED_LEAVED,
      data: room.users,
    });
    RoomService.onEditLobbySocket(room.roomCode, 'users', room.users.length);
    await room.save();
    return 'Leaved Room';
  }

  static kickPlay = async (userId, room) => {
    const {isMember, index} = RoomService.findOnRoom(room, userId);
    if (!isMember) {
      return 'You can not kick play. Who is not in lobby';
    }
    const kickedPlay = RoomService.removeUserFromRoom(room, index);
    const kickedPlayId = kickedPlay[0].user._id;
    room.kickedUsers = room.kickedUsers.concat(kickedPlayId);
    Socket.emit(room.roomCode, {
      type: RoomService.types.ROOM_JOINED_LEAVED,
      data: room.users,
    });
    Socket.emit(room.roomCode, {
      type: RoomService.types.KICKED_PLAYER,
      data: {
        id: kickedPlayId,
      },
    });
    RoomService.onEditLobbySocket(room.roomCode, 'users', room.users.length);
    await room.save();
    return 'Play Kicked';
  }

  static editRoom = (roomCode, data) => {
    Socket.emit(roomCode, {
      type: RoomService.types.ROOM_EDIT,
      data,
    });
  }

  static removeUserFromRoom = (room, index) => {
    return room.users.splice(index, 1);
  }

  static async processRoomEdit({roomCode, data}) {
    Socket.emit(roomCode, {
      type: RoomService.types.ROOM_EDIT,
      data,
    });
    const {key, value} = data;
    const room = await RoomService.getPublicRoomDetail(roomCode);
    switch (key) {
      case 'Round':
        room.rounds = value;
        RoomService.onEditLobbySocket(room.roomCode, 'rounds', value);
        break;
      case 'Draw Time':
        room.drawTime = value;
        RoomService.onEditLobbySocket(room.roomCode, 'drawTime', value);
        break;
      case 'Sub_Category':
        // room.category = data.value;
        break;
      case 'Privacy':
        room.privacy = value;
        if (value === 'PUBLIC') {
          RoomService.onEditLobbySocket(room.roomCode, 'privacy', value);
        } else {
          Socket.emit(RoomService.types.DELETED_LOBBY, {
            roomCode: room.roomCode,
          });
        }
        break;
    }
    await room.save();
  }

  static sendNewRoomSocket = (privacy, room) => {
    if (privacy === 'PUBLIC') {
      Socket.emit(RoomService.types.NEW_LOBBY, RoomService.filterRoom(room));
    }
  }

  static getPublicRoomDetail = async (roomCode) => {
    return await Database.Room.findOne({
      roomCode,
    }).populate('category', ['name', 'language']).populate('owner.user', ['email', 'name']);
  }

  static filterRoom = (roomData) => {
    const room = JSON.parse(JSON.stringify(roomData));
    RoomService.setRoomProperties(room);
    return room;
  }

  static setRoomProperties = (room) => {
    delete room.kickedUsers;
    room.owner.user.name = room.owner.user.name.split(' ')[0];
    room.users = room.users.length;
  }

  static getAllPublicRooms = async () => {
    const allRooms = await Database.Room.find({
      privacy: 'PUBLIC',
    }).populate('category', ['name', 'language']).populate('owner.user', ['email', 'name']).sort('-updatedAt');
    const allPublicRooms = JSON.parse(JSON.stringify(allRooms));
    for (const room of allPublicRooms) {
      RoomService.setRoomProperties(room);
    }
    return allPublicRooms;
  }
}

export default RoomService;
