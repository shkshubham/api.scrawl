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
    };
    const {rounds, drawTime, users, category, roomCode, owner} = room;
    this.roomCode = roomCode;
    this.playerGuessed = {};
    this.rounds = rounds;
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
    this.time += 1;
    Socket.emit(this.roomCode, this.time);
  }

  sendTimerToClient() {
    setInterval(this.timeCallback, 1000);
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

  startTime() {
    this.time -= 1;
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
    console.log('-------------------------', data, this.currentSelectedWord);
    Socket.emit(this.roomCode, {
      type: 'LOBBY_WORD',
      data: word,
    });
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
        console.log(`SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`);

        EventHandler.eventEmitter.on(`SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`, (data) => this.wordSelectCallback(data));
      }
    } catch (err) {
      Logger.log('log', err);
    }
  }

  startNewDrawing() {
    this.playerGuessed = {};
    this.time = this.drawTime;
    this.sendWordSelection();
  }

  startNewRound() {
    this.startNewDrawing();
  }

  startRounds() {
    this.startNewRound();
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
