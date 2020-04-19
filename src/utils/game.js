import Socket from '../services/socket.service';
import Database from '../database';
import Utils from '.';
import Logger from './logger';
import EventHandler from './EventHandler';

class Game {
  constructor(room) {
    this.types = {
      LOBBY_CHAT: 'LOBBY_CHAT',
      LOBBY_PLAYER_GUESSED_WORD: 'LOBBY_PLAYER_GUESSED_WORD',
      LOBBY_TIMER: 'LOBBY_TIMER',
      LOBBY_TIME_UP: 'LOBBY_TIME_UP',
      LOBBY_ROUNDS: 'LOBBY_ROUNDS',
      GAME_OVER: 'GAME_OVER',
    };
    const {rounds, drawTime, users, category, roomCode, owner} = room;
    this.roomCode = roomCode;
    this.playerGuessed = {};
    this.rounds = rounds;
    this.roundsCounter = 1;
    this.drawTime = drawTime;
    this.users = [owner, ...users];
    this.time = drawTime;
    this.words = [];
    this.selectedWords = {};
    this.wordSelectionList = [];
    this.wordSelectionPlayerLeft = JSON.parse(JSON.stringify(this.users));
    this.categoryId = category._id;
    this.currentDrawingPlayerId = '';
    this.currentSelectedWord = '';
    this.timerIntervalId = null;
    EventHandler.eventEmitter.on(this.roomCode, ({type, data}) => {
      switch (type) {
        case 'CLIENT_CHAT':
          this.processComments(this.roomCode, data);
          break;
      }
    });
  }

  async getWords() {
    const categoryWord = await Database.Category.findById(this.categoryId);
    this.words = categoryWord.words;
  }

  getGameWords() {

  }

  selectWords() {

  }

  timeCallback() {
    this.time -= 10;
    Socket.emit(this.roomCode, {
      type: this.types.LOBBY_TIMER,
      data: this.time,
    });
    if (this.time === 0) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
      Socket.emit(this.roomCode, {
        type: this.types.LOBBY_TIME_UP,
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
    Socket.emit(this.roomCode, {
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
        console.log('===============', `CLIENT_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`);
        Socket.emit(`CLIENT_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`, this.wordSelectionList);
        Socket.emit(this.roomCode, {
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
    return `SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`;
  }

  startNewDrawing() {
    this.wordSelectionList = [];
    this.playerGuessed = {};
    this.time = Number(this.drawTime);
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
    return usersScoreData;
  }

  getUserScore() {
    const usersScoreData = [];
    for (const {user} of this.users) {
      usersScoreData.push({
        score,
        name: user.name,
      });
    }
    return usersScoreData;
  }

  startNewRound() {
    if (this.roundsCounter !== Number(this.rounds)) {
      this.roundsCounter +=1;
      this.wordSelectionPlayerLeft = JSON.parse(JSON.stringify(this.users));
      Socket.emit(this.roomCode, {
        type: this.types.LOBBY_ROUNDS,
        data: this.roundsCounter,
      });
      this.startNewDrawing();
    } else {
      Socket.emit(this.roomCode, {
        type: this.types.GAME_OVER,
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

  processComments(roomCode, data) {
    this.checkAndSetWord(roomCode, data);
    Socket.emit(roomCode, {
      type: this.types.LOBBY_CHAT,
      data,
    });
  }

  checkAndSetWord(roomCode, data) {
    const {message} = data;
    if (message.length) {
      const found = message.find((word) => word.toLowerCase() === this.currentSelectedWord);
      console.log('Found Word: ', found, this.currentSelectedWord);
      if (found) {
        Socket.emit(roomCode, {
          type: this.types.LOBBY_PLAYER_GUESSED_WORD,
          data: data.user.userId,
        });
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
