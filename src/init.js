import Socket from './services/socket.service';
import Database from './database';

class Init {
  static socket() {
    Socket.init();
  }

  static database() {
    Database.init();
  }

  static init() {
    this.socket();
    this.database();
  }
}

export default Init;
