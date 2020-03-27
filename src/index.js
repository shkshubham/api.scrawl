import Config from './configs';
import Init from './init';
import Logger from './utils/logger';
import Routes from './routes/app';
import Database from './database';
import {createServer} from 'http';
const server = createServer(Routes.app);

Database.init().then(() => {
  Init.init(server);
  server.listen(Config.SERVER_PORT, () => {
    Logger.log('table', {
      'Server Started': true,
      'Socket Started': true,
      'PORT': Config.SERVER_PORT,
    });
  });
}).catch((error) => {
  Logger.log('log', error);
});
