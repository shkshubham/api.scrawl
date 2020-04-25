import Socket from '../services/socket.service';
import Database from '../database';
import Utils from '.';
import Logger from './logger';
import EventHandler from './EventHandler';
import Types from '../types/types';

class Game {
  constructor(lobby) {
    const {rounds, drawTime, users, category, lobbyCode, owner} = lobby;
    this.lobbyCode = lobbyCode;
    this.playerGuessed = {};
    this.rounds = Number(rounds);
    this.roundsCounter = 1;
    this.drawTime = drawTime;
    this.users = [owner, ...users];
    this.time = Number(drawTime);
    this.words = [];
    this.selectedWords = {};
    this.wordSelectionList = [];
    this.wordSelectionPlayerLeft = JSON.parse(JSON.stringify(this.users));
    this.categoryId = category._id;
    this.currentDrawingPlayerId = '';
    this.currentSelectedWord = '';
    this.timerIntervalId = null;
    this.scorePerSecond = 10;
    this.drawingLinePath = null;
    this.isDrawingPlayerGotPoint = false;
    EventHandler.eventEmitter.on(this.lobbyCode, ({type, data}) => {
      switch (type) {
        case Types.EVENT_EMITTER_TYPES.CHAT.CHAT:
          this.processComments(this.lobbyCode, data);
          break;
        case Types.EVENT_EMITTER_TYPES.DRAWING.RELEASE:
          this.sendReleaseDrawingPathToClient(Types.SOCKET_TYPES.DRAWING.RELEASE.SERVER, data);
          break;
        case Types.EVENT_EMITTER_TYPES.DRAWING.TOUCH:
          this.sendTouchDrawingPathToClient(Types.SOCKET_TYPES.DRAWING.TOUCH.SERVER, data);
          break;
        case Types.EVENT_EMITTER_TYPES.DRAWING.CLEAR:
          this.sendClearToClient(Types.SOCKET_TYPES.DRAWING.CLEAR.SERVER, data);
          break;
      }
    });
  }

  async getWords() {
    const categoryWord = await Database.Category.findById(this.categoryId);
    this.words = categoryWord.words;
  }


  setDrawingPath(data) {
    if (this.drawingLinePath) {
      const {
        id,
        color,
        width,
      } = data.path;
      this.drawingLinePath.path.id = id;
      // this.drawingLinePath.size ={width: 574.09521484375, height: 357.3333435058594};
      this.drawingLinePath.path.data.push(...data.path.data);
      this.drawingLinePath.path.color = color;
      this.drawingLinePath.path.width = width;
    } else {
      this.drawingLinePath = data;
    }
  }

  sendTouchDrawingPathToClient(type, data) {
    console.log('DRAWING', type, data);
    this.setDrawingPath(data);
    Socket.emitDrawing(this.lobbyCode, {
      type,
      data: this.drawingLinePath,
      // data
    });
  }

  sendReleaseDrawingPathToClient(type, data) {
    this.drawingLinePath = null;
    Socket.emitDrawing(this.lobbyCode, {
      type,
      data: null,
    });
  }

  sendClearToClient(type, data=null) {
    this.drawingLinePath = null
    Socket.emitDrawing(this.lobbyCode, {
      type,
      data,
    });
  }

  getGameWords() {

  }

  selectWords() {

  }

  timeCallback() {
    this.time -= 1;
    Socket.emit(this.lobbyCode, {
      type: Types.SOCKET_TYPES.GAME.LOBBY_TIMER,
      data: this.time,
    });
    if (this.time === 0) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
      Socket.emit(this.lobbyCode, {
        type: Types.SOCKET_TYPES.GAME.LOBBY_TIME_UP,
        data: {
          word: this.currentSelectedWord,
          usersScoreData: this.getUserScore(),
        },
      });
      EventHandler.eventEmitter.removeAllListeners(this.getServerLobbyChooseWordEventName(), function() {
        console.log('removed');
      });
      setTimeout(() => {
        if (this.wordSelectionPlayerLeft.length) {
          this.startNewDrawing();
        } else {
          this.startNewRound();
        }
      }, 2000);
    }
  }

  sendTimerToClient() {
    this.timerIntervalId = setInterval(() =>this.timeCallback(), 1000);
  }

  setSelectedWord(word) {
    this.selectedWords = {
      ...this.selectedWords,
      word,
    };
  }

  setWordSelectionPlayers() {
    this.wordSelectionPlayerLeft = JSON.parse(JSON.stringify(this.users));
  }

  getTime() {
    return this.time;
  }

  wordSelectCallback(data) {
    this.currentSelectedWord = data.toLowerCase();
    let word = '';
    // eslint-disable-next-line no-unused-vars
    for (const wordAlpha of this.currentSelectedWord.split('')) {
      if (wordAlpha === ' ') {
        word+=' ';
      } else {
        word+='_';
      }
    }
    Socket.emit(this.lobbyCode, {
      type: 'LOBBY_WORD',
      data: word,
    });
    this.sendTimerToClient();
  }

  sendWordSelection() {
    try {
      const randomPlayerIndex = Utils.generateRandomNumber(this.wordSelectionPlayerLeft.length);
      const selectingUser = this.wordSelectionPlayerLeft.splice(randomPlayerIndex, 1);
      for (let index=0; index <3; index++) {
        const randomWordIndex = Utils.generateRandomNumber(this.words.length);
        this.wordSelectionList.push(...this.words.splice(randomWordIndex, 1));
      }
      if (selectingUser.length) {
        const {score, user} = selectingUser[0];
        const {_id, name, picture} = user;
        this.currentDrawingPlayerId = _id;
        console.log('User: => ', `CLIENT_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.lobbyCode}`);
        Socket.emit(`CLIENT_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.lobbyCode}`, this.wordSelectionList);
        Socket.emit(this.lobbyCode, {
          type: 'CLIENT_PLAYER_SELECTING_WORD',
          data: {
            _id,
            score,
            name,
            picture,
          },
        });
        Logger.log('table', user);
        Logger.log('table', this.wordSelectionList);
        console.log(this.getServerLobbyChooseWordEventName());

        EventHandler.eventEmitter.on(this.getServerLobbyChooseWordEventName(), (data) => this.wordSelectCallback(data));
      }
    } catch (err) {
      Logger.log('log', err);
    }
  }

  getServerLobbyChooseWordEventName() {
    return `SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.lobbyCode}`;
  }

  sorting(a, b) {
    if (a.score > b.score) return -1;
    if (b.score > a.score) return 1;

    return 0;
  }

  sortScore(data) {
    return data.sort(this.sorting);
  }

  startNewDrawing() {
    this.isDrawingPlayerGotPoint = true;
    this.wordSelectionList = [];
    this.playerGuessed = {};
    this.time = Number(this.drawTime);
    this.drawingLinePath = null;
    this.sendWordSelection();
  }

  getUsersGameOverScore() {
    const usersScoreData = [];
    for (const {score, user} of this.users) {
      const {picture, name} = user;
      usersScoreData.push({
        score,
        name,
        picture,
      });
    }
    return this.sortScore(usersScoreData);
  }

  getUserScore() {
    const usersScoreData = [];
    for (const {user, score} of this.users) {
      usersScoreData.push({
        score,
        name: user.name,
      });
    }
    return this.sortScore(usersScoreData);
  }

  startNewRound() {
    if (this.roundsCounter !== this.rounds) {
      this.roundsCounter +=1;
      this.wordSelectionPlayerLeft = JSON.parse(JSON.stringify(this.users));
      Socket.emit(this.lobbyCode, {
        type: Types.SOCKET_TYPES.GAME.LOBBY_ROUNDS,
        data: this.roundsCounter,
      });
      this.startNewDrawing();
    } else {
      Socket.emit(this.lobbyCode, {
        type: Types.SOCKET_TYPES.GAME.GAME_OVER,
        data: this.getUsersGameOverScore(),
      });
    }
  }

  startRounds() {
    this.startNewDrawing();
  }

  async startGame() {
    await this.getWords();
    this.startRounds();
  }

  processComments(lobbyCode, data) {
    this.checkAndSetWord(lobbyCode, data);
    Socket.emit(lobbyCode, {
      type: Types.SOCKET_TYPES.GAME.LOBBY_CHAT,
      data,
    });
  }

  getScore() {
    return Math.round(this.time * this.scorePerSecond);
  }

  setPlayerGuessed(id) {
    this.playerGuessed = {
      ...this.playerGuessed,
      [id]: true,
    };
  }

  setScore(data) {
    const foundUser = this.users.find(({user}) => user._id === data.user.userId);

    if (!this.isDrawingPlayerGotPoint) {
      this.isDrawingPlayerGotPoint = true;
      const playerDrawing = this.users.find(({user}) => user._id === this.currentDrawingPlayerId);
      playerDrawing.score = (this.getScore() - 50) + Number(foundUser.score);
    }

    foundUser.score = this.getScore() + Number(foundUser.score);

    this.setPlayerGuessed(data.user.userId);
    console.log(Object.keys(this.playerGuessed).length, this.users.length -1);
    if (Object.keys(this.playerGuessed).length !== this.users.length -1) {
      this.time -= 5;
    } else {
      this.time = 1;
    }
  }

  checkAndSetWord(lobbyCode, data) {
    const {message} = data;
    if (message.length) {
      const found = message.find((word) => word.toLowerCase() === this.currentSelectedWord);
      console.log('Found Word: ', found, this.currentSelectedWord, message);
      if (found) {
        Socket.emit(lobbyCode, {
          type: Types.SOCKET_TYPES.GAME.LOBBY_PLAYER_GUESSED_WORD,
          data: data.user.userId,
        });
        this.setScore(data);
        data.message = 'Guessed the word';
      } else {
        data.message = message[0];
      }
    } else {
      data.message = '';
    }
  }
}

export default Game;
