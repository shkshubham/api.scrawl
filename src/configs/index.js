import {config} from 'dotenv';

config();

class Config {
    static SERVER_PORT = process.env.SERVER_PORT;
    static SOCKET_PORT = process.env.SOCKET_PORT;
    static DB_URL = process.env.DB_URL;
}

export default Config;
