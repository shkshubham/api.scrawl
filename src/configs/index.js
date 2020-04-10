import {config} from 'dotenv';
import Logger from '../utils/logger';

config();

Logger.log('log', process.env);
class Config {
    static SERVER_PORT = process.env.PORT;
    static SOCKET_PORT = process.env.SOCKET_PORT;
    static DB_URL = process.env.DB_URL;
    static SECRET_KEY = process.env.SECRET_KEY || 'secret';
    static REDIS = {
      PASSWORD: process.env.REDIS_PASSWORD,
      HOST: process.env.REDIS_HOST,
      PORT: process.env.REDIS_PORT,
    }
}

export default Config;

