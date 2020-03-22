import {config} from 'dotenv';

config();

class Config {
    static SERVER_PORT = process.env.PORT;
    static SOCKET_PORT = process.env.SOCKET_PORT;
    static DB_URL = process.env.DB_URL;
    static SECRET_KEY = process.env.SECRET_KEY || 'secret';
}

export default Config;
