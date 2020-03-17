import fs from 'fs';
import path from 'path';
import express from 'express';
import morgan from 'morgan';

class Routes {
    static basename = path.basename(__filename);
    static app = express();
    static Router = express.Router;
    static setUrl(fileName) {
      return `/${fileName}`;
    }


    static initAPI() {
      fs.readdirSync(__dirname)
          .filter((file) => {
            return (
              file.indexOf('.') !== 0 && file !== this.basename &&
          file.slice(-3) === '.js'
            );
          })
          .forEach((file) => {
            if (file !== 'index.js') {
              const fileName = path.join(__dirname, file);
              const url = this.setUrl(file.split('.')[0].toLowerCase());
              const route = require(fileName).default;
              if (route) {
                this.app.use(url, route);
              }
            }
          });
    }

    static initApp() {
      this.app.use(express.json());
      this.app.use(morgan('tiny'));
    }

    static init() {
      this.initApp();
      this.initAPI();
    }
}

export default Routes;
