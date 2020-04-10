import Bull from 'bull';
import Socket from '../services/socket.service';
import Logger from './logger';
import Config from '../configs';
class Queue {
    static drawingQueue = new Bull('DRAWING')
    static Redis = {redis: {port: Config.REDIS.PORT, host: Config.REDIS.HOST, password: Config.REDIS.PASSWORD}}
    static processDrawingQueue({data}, done) {
      Socket.io.emit('SERVER_DRAWING_TOUCH', data);
      Logger.log('log', data);
      done();
    }
}

export default Queue;
