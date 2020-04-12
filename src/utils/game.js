import Socket from '../services/socket.service';
import Database from '../database';
import Utils from '.';
import Logger from './logger';
import EventHandler from './EventHandler';

class Game {
  constructor(room) {
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
    console.log(`SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`, data);
    this.currentSelectedWord = data;
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
        this.currentDrawingPlayerId= _id;

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
        EventHandler.eventEmitter.on(`SERVER_LOBBY_CHOOSE_WORD_${this.currentDrawingPlayerId}_${this.roomCode}`, this.wordSelectCallback);
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
}

export default Game;
