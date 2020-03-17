import express from 'express';
import Config from './configs';
import Init from './init';
import Logger from './utils/logger';

Init.init();
const app = express();

app.listen(Config.SERVER_PORT, () => {
  Logger.log('table', {
    'Server Started': true,
    'PORT': Config.SERVER_PORT,
  });
})
;
