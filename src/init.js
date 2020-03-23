import Socket from './services/socket.service';
import Database from './database';
import Routes from './routes/app';

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
  }
}

export default Init;
