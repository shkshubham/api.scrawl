class Types {
    static SOCKET_TYPES = {
      GAME: {
        STARTED: 'GAME_STARTED',
        LOBBY_CHAT: 'LOBBY_CHAT',
        LOBBY_PLAYER_GUESSED_WORD: 'LOBBY_PLAYER_GUESSED_WORD',
        LOBBY_TIMER: 'LOBBY_TIMER',
        LOBBY_TIME_UP: 'LOBBY_TIME_UP',
        LOBBY_ROUNDS: 'LOBBY_ROUNDS',
        GAME_OVER: 'GAME_OVER',
      },
      LOBBY: {
        EDIT: Types.createClientAndServerObj('LOBBY_EDIT'),
        JOINED_LEAVED: 'LOBBY_JOINED_LEAVED',
        KICKED_PLAYER: 'PLAYER_KICKED',
        LOBBY_OWNER: 'LOBBY_OWNER',
        NEW_LOBBY: 'NEW_LOBBY',
        PUBLIC_LOBBY_EDIT: 'PUBLIC_LOBBY_EDIT',
        DELETED_LOBBY: 'DELETED_LOBBY',
      },
      DRAWING: {
        TOUCH: Types.createClientAndServerObj('DRAWING_TOUCH'),
        RELEASE: Types.createClientAndServerObj('DRAWING_RELEASE'),
        CLEAR: Types.createClientAndServerObj('CLEAR'),
      },
      CHAT: {
        CHAT: Types.createClientAndServerObj('CHAT'),
      },
      LOOKING: {
        PLAYERS_JOINED: 'LOOKING_PLAYERS_JOINED',
        PLAYERS_LEAVED: 'LOOKING_PLAYERS_LEAVED',
      },
    }

    static EVENT_EMITTER_TYPES = {
      DRAWING: {
        TOUCH: Types.createClientAndServerObj('DRAWING_TOUCH').CLIENT,
        RELEASE: Types.createClientAndServerObj('DRAWING_RELEASE').CLIENT,
        CLEAR: Types.createClientAndServerObj('CLEAR').CLIENT,
      },
      CHAT: {
        CHAT: Types.createClientAndServerObj('CHAT').CLIENT,
      },
    }

    static createClientAndServerObj(event) {
      return {
        CLIENT: `CLIENT_${event}`,
        SERVER: `SERVER_${event}`,
      };
    }
}

export default Types;
