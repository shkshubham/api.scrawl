import Config from './configs';
import Init from './init';
import Logger from './utils/logger';
import Routes from './routes';

Init.init();

Routes.app.listen(Config.SERVER_PORT, () => {
  Logger.log('table', {
    'Server Started': true,
    'PORT': Config.SERVER_PORT,
  });
});
