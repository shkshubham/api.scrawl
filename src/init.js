import Socket from './services/socket.service';
import Database from './database';
import Routes from './routes/app';
import {category, rounds, drawTime} from './data/lobby';

class Init {
  static socket() {
    Socket.init();
  }

  static database() {
    Database.init();
  }

  static routes() {
    Routes.init();
  }

  static init() {
    this.socket();
    this.routes();
    this.data();
  }

  static async data() {
    const lobbyData = await Database.Lobby.findOne().lean();
    const foundCategories = await Database.Category.find().select(['name', 'language']).lean();
    if (!foundCategories.length) {
      for (const cat of category) {
        await Database.Category.create(cat);
      }
    }
    if (!lobbyData) {
      return await Database.Lobby.create({
        rounds,
        drawTime,
      });
    }
  }
}

export default Init;
