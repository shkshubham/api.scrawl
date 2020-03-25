import {connect} from 'mongoose';
import Config from './configs';
import Logger from './utils/logger';
import UserModelSchema from './models/User';
import LobbySchema from './models/Lobby';
import CategorySchema from './models/Category';
import RoomSchema from './models/Room';

class Database {
    static User;
    static Lobby;
    static Category;
    static mongoose;
    static Room;

    static initModel() {
      this.User = Database.mongoose.model('User', UserModelSchema);
      this.Lobby = Database.mongoose.model('Lobby', LobbySchema);
      this.Category = Database.mongoose.model('Category', CategorySchema);
      this.Room = Database.mongoose.model('Room', RoomSchema);
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
