import Bull from 'bull';
import Socket from '../services/socket.service';
import Logger from './logger';
class Queue {
    static drawingQueue = new Bull('DRAWING')

    static processDrawingQueue({data}, done) {
      Socket.io.emit('SERVER_DRAWING_TOUCH', data);
      Logger.log('log', data);
      done();
    }
}

export default Queue;
