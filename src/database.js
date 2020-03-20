import {connect} from 'mongoose';
import Config from './configs';
import Logger from './utils/logger';
import UserModelSchema from './models/User';
import LobbySchema from './models/Lobby';

class Database {
    static User;
    static Lobby;
    static mongoose;

    static initModel() {
      this.User = Database.mongoose.model('User', UserModelSchema);
      this.Lobby = Database.mongoose.model('Lobby', LobbySchema);
    }

    static init() {
      return new Promise((resolve, reject) => {
        connect(Config.DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }).then((mongoose) => {
          Database.mongoose = mongoose;
          this.initModel();
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
}

export default Database;
