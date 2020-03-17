import {Schema, connect} from 'mongoose';
import Config from './configs';
import Logger from './utils/logger';

class Database {
    static mongoose;
    static init() {
      return new Promise((resolve, reject) => {
        connect(Config.DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }).then((mongoose) => {
          Database.mongoose = mongoose;
          Logger.log('table', {mongoose: true});
          return resolve(true);
        }).catch((error) => {
          Logger.log('table', {
            mongoose: false,
            error,
          });
          return reject(error);
        });
      });
    }
    static Schema = Schema;
}

export default Database;
