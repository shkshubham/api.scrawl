import {connect} from 'mongoose';
import Config from './configs';
import Logger from './utils/logger';
import UserModelSchema from './models/User';
import GameSchema from './models/Game';
import CategorySchema from './models/Category';
import LobbySchema from './models/Lobby';
import CountrySchema from './models/Country';

class Database {
    static mongoose;
    static User;
    static Game;
    static Category;
    static Lobby;
    static Country;

    static initModel() {
      this.User = Database.mongoose.model('User', UserModelSchema);
      this.Game = Database.mongoose.model('Game', GameSchema);
      this.Category = Database.mongoose.model('Category', CategorySchema);
      this.Lobby = Database.mongoose.model('Lobby', LobbySchema);
      this.Country = Database.mongoose.model('Country', CountrySchema);
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
