import Socket from './services/socket.service';
import Database from './database';
import Routes from './routes/app';
import {category, rounds, drawTime} from './data/lobby';
import {countries} from './data/countries';
import path from 'path';
import fs from 'fs';
import Logger from './utils/logger';

class Init {
  static socket(server) {
    Socket.init(server);
  }

  static database() {
    Database.init();
  }

  static routes() {
    Routes.init();
  }

  static init(server) {
    this.socket(server);
    this.routes();
    this.data();
    this.initCountries();
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
  static async initCountries() {
    const countriesFound = await Database.Country.find().lean();
    Logger.log('table', {
      countries: countriesFound.length,
    });
    if (countriesFound.length) {
      return true;
    }
    countries.forEach(async (country) => {
      Init.inertFlagToDB(country);
    });
  }

  static inertFlagToDB(country) {
    const flagPath = path.join(__dirname, '..', 'assets', 'flags', `${country}.svg`);
    fs.readFile(flagPath, 'utf8', async (err, data) => {
      if ( err ) {
        Logger.log('error', {
          msg: 'Insert Error Error',
          data: country,
        });
      } else {
        const svg = data.toString();
        await Database.Country.create({
          name: country,
          svg,
        });
        Logger.log('log', 'done');
      }
    });
  }
}

export default Init;
