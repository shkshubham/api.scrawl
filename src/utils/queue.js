import Bull from 'bull';
import Config from '../configs';
import Game from './game';
const Redis = {redis: {port: Config.REDIS.PORT, host: Config.REDIS.HOST, password: Config.REDIS.PASSWORD}};
class Queue {
    static gameQueue = new Bull('DRAWING', Redis)
    static processGameQueue({data}, done) {
      try {
        const game = new Game(data);
        console.log('Game: => ', game);
        game.startGame();
        done();
      } catch (err) {
        console.log('Error', err);
      }
    }
}

export default Queue;
