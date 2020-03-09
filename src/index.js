import express from 'express';
import Socket from './services/socket.service';
import Config from './configs';

const app = express();

Socket.init()

app.listen(Config.SERVER_PORT, () => {
    console.log({
        "Server Started": true,
        "PORT": Config.SERVER_PORT
    })
})