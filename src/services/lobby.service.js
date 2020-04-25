import Database from '../database';
import Utils from '../utils';
import {drawTime, rounds} from '../data/lobby';
import Socket from './socket.service';
import Types from '../types/types';

class LobbyService {
  static createLobby = async (req) => {
    const {user} = req;
    const lobbyCode = Utils.generateRandomString();
    const lobby = await Database.Lobby.create({
      lobbyCode,
      drawTime: drawTime[2],
      rounds: rounds[2],
      category: '5e9cac1d88aae73ea44371a7',
      owner: {
        user: user._id,
      },
    });
    LobbyService.onCreateLobbySocket(lobby);
    return lobby;
  }

  static getLobbyDetail = async (lobbyCode) => {
    const userFields = ['name', 'picture', 'email'];
    const categoryFields = ['name', 'language'];
    return await Database.Lobby.findOne({lobbyCode}).populate('owner.user', userFields).populate('users.user', userFields).populate('category', categoryFields);
  }

  static findLobbyByLobbyCode = async (lobbyCode) => {
    return await Database.Lobby.findOne({
      lobbyCode,
    });
  }

  static getLobbyWithOwnerDetail = async (lobbyCode) => {
    const userFields = ['name', 'picture'];
    return await Database.Lobby.findOne({lobbyCode}).populate('owner.user', userFields).lean();
  }

  static findOnLobby = (lobby, userId) => {
    const payload = {
      isMember: false,
      index: -1,
    };
    if (!lobby.users.length) {
      return payload;
    }
    const foundIndex = lobby.users.findIndex((userData) => userData.user._id.toString() === userId);
    if (foundIndex > -1) {
      payload.isMember = true;
      payload.index = foundIndex;
      return payload;
    }
    return payload;
  }

  static joinLobby = async (userId, lobby) => {
    const {isMember} = LobbyService.findOnLobby(lobby, userId);

    if (isMember) {
      Socket.emit(lobby.lobbyCode, {
        type: Types.SOCKET_TYPES.LOBBY.JOINED_LEAVED,
        data: lobby.users,
      });
      return {
        lobby,
        message: 'Lobby Joined',
      };
    }

    lobby.users = lobby.users.concat({
      user: userId,
    });
    LobbyService.onEditLobbySocket(lobby.lobbyCode, 'users', lobby.users.length);
    await lobby.save();
    const lobbyAfterUpdate = await LobbyService.getLobbyDetail(lobby.lobbyCode);
    Socket.emit(lobby.lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.JOINED_LEAVED,
      data: lobbyAfterUpdate.users,
    });
    return {
      lobby: lobbyAfterUpdate,
      message: 'Lobby Joined',
    };
  }

  static onCreateLobbySocket = async (lobby) => {
    const filteredLobby = await LobbyService.getPublicLobbyDetail(lobby.lobbyCode);
    LobbyService.sendNewLobbySocket(lobby.privacy, filteredLobby);
  }

  static onEditLobbySocket = async (lobbyCode, key, value) => {
    Socket.emit(Types.SOCKET_TYPES.LOBBY.PUBLIC_LOBBY_EDIT, {
      lobbyCode,
      data: {
        key,
        value,
      },
    });
  }

  static findIsLobbyOwner = (lobby, userId) => {
    return lobby.owner.user._id.toString() === userId;
  }

  static leaveLobby = async (userId, lobby) => {
    const {isMember, index} = LobbyService.findOnLobby(lobby, userId);
    if (!isMember) {
      const isOwner = LobbyService.findIsLobbyOwner(lobby, userId);
      if (isOwner) {
        if (lobby.users.length) {
          const userData = JSON.parse(JSON.stringify(lobby.users[0]));
          const data = {
            user: {
              _id: userData.user._id,
              score: userData.user.score,
              picture: userData.user.picture,
              name: userData.user.name,
            },
          };
          lobby.owner = {
            user: userData.user._id,
            score: userData.user.score,
          };
          LobbyService.removeUserFromLobby(lobby, 0);
          Socket.emit(lobby.lobbyCode, {
            type: Types.SOCKET_TYPES.LOBBY.LOBBY_OWNER,
            data,
          });
          Socket.emit(lobby.lobbyCode, {
            type: Types.SOCKET_TYPES.LOBBY.JOINED_LEAVED,
            data: lobby.users,
          });
          LobbyService.onEditLobbySocket(lobby.lobbyCode, 'users', lobby.users.length);
          await lobby.save();
          return 'Leaved Lobby';
        } else {
          Socket.emit(Types.SOCKET_TYPES.LOBBY.DELETED_LOBBY, {
            lobbyCode: lobby.lobbyCode,
          });
          await lobby.delete();
          return 'Lobby Deleted';
        }
      } else {
        return 'You can not the member of the lobby';
      }
    }
    LobbyService.removeUserFromLobby(lobby, index);
    Socket.emit(lobby.lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.JOINED_LEAVED,
      data: lobby.users,
    });
    LobbyService.onEditLobbySocket(lobby.lobbyCode, 'users', lobby.users.length);
    await lobby.save();
    return 'Leaved Lobby';
  }

  static kickPlayer = async (userId, lobby) => {
    const {isMember, index} = LobbyService.findOnLobby(lobby, userId);
    if (!isMember) {
      return 'You can not kick play. Who is not in lobby';
    }
    const kickedPlay = LobbyService.removeUserFromLobby(lobby, index);
    const kickedPlayId = kickedPlay[0].user._id;
    lobby.kickedUsers = lobby.kickedUsers.concat(kickedPlayId);
    Socket.emit(lobby.lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.JOINED_LEAVED,
      data: lobby.users,
    });
    Socket.emit(lobby.lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.KICKED_PLAYER,
      data: {
        id: kickedPlayId,
      },
    });
    LobbyService.onEditLobbySocket(lobby.lobbyCode, 'users', lobby.users.length);
    await lobby.save();
    return 'Play Kicked';
  }

  static editLobby = (lobbyCode, data) => {
    Socket.emit(lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.EDIT.CLIENT,
      data,
    });
  }

  static removeUserFromLobby = (lobby, index) => {
    return lobby.users.splice(index, 1);
  }

  static async processLobbyEdit({lobbyCode, data}) {
    Socket.emit(lobbyCode, {
      type: Types.SOCKET_TYPES.LOBBY.EDIT.SERVER,
      data,
    });
    const {key, value} = data;
    const lobby = await LobbyService.getPublicLobbyDetail(lobbyCode);
    switch (key) {
      case 'Round':
        lobby.rounds = value;
        LobbyService.onEditLobbySocket(lobby.lobbyCode, 'rounds', value);
        break;
      case 'Draw Time':
        lobby.drawTime = value;
        LobbyService.onEditLobbySocket(lobby.lobbyCode, 'drawTime', value);
        break;
      case 'Sub_Category':
        // lobby.category = data.value;
        break;
      case 'Privacy':
        lobby.privacy = value;
        if (value === 'PRIVATE') {
          Socket.emit(Types.SOCKET_TYPES.LOBBY.DELETED_LOBBY, {
            lobbyCode: lobby.lobbyCode,
          });
        } else {
          LobbyService.onCreateLobbySocket(lobby);
        }
        break;
    }
    await lobby.save();
  }

  static sendNewLobbySocket = (privacy, lobby) => {
    if (privacy === 'PUBLIC') {
      Socket.emit(Types.SOCKET_TYPES.LOBBY.NEW_LOBBY, LobbyService.filterLobby(lobby));
    }
  }

  static getPublicLobbyDetail = async (lobbyCode) => {
    return await Database.Lobby.findOne({
      lobbyCode,
    }).populate('category', ['name', 'language']).populate('owner.user', ['email', 'name']);
  }

  static filterLobby = (lobbyData) => {
    const lobby = JSON.parse(JSON.stringify(lobbyData));
    LobbyService.setLobbyProperties(lobby);
    return lobby;
  }

  static setLobbyProperties = (lobby) => {
    delete lobby.kickedUsers;
    lobby.owner.user.name = lobby.owner.user.name.split(' ')[0];
    lobby.users = lobby.users.length;
  }

  static getAllPublicLobbies = async () => {
    const allLobbies = await Database.Lobby.find({
      privacy: 'PUBLIC',
    }).populate('category', ['name', 'language']).populate('owner.user', ['email', 'name']).sort('-updatedAt').lean();
    for (const lobby of allLobbies) {
      LobbyService.setLobbyProperties(lobby);
    }
    return allLobbies;
  }
}

export default LobbyService;
