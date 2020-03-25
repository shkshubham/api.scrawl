import jwt from 'jsonwebtoken';
import Database from '../database';
import Config from '../configs';
import Responses from '../utils/responses';
import Logger from '../utils/logger';

class Auth {
  static logReqBody(body) {
    Logger.log('log', body);
  }
  static async getUserTokenAndData(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return {
        user: null,
        token: null,
      };
    }
    const token = authHeader.replace('Bearer ', '');
    const data = jwt.verify(token, Config.SECRET_KEY);
    return {
      user: await Database.User.findOne({'_id': data._id, 'tokens.token': token}),
      token,
    };
  }

  static async UserAccess(req, res, next) {
    try {
      Auth.logReqBody(req.body);
      const {user, token} = await Auth.getUserTokenAndData(req);
      if (!user) {
        return res.status(401).send(Responses.response('Please Log In'));
      }
      const userData = JSON.parse(JSON.stringify(user));
      delete userData.password;
      delete userData.tokens;
      delete userData.__v;
      req.user = userData;
      req.token = token;
      return next();
    } catch (error) {
      res.status(401).send({error: 'Not authorized to access this resource'});
    }
  }

  static AllAccess(_, __, next) {
    return next();
  }

  static async GuestAccess(req, res, next) {
    Auth.logReqBody(req.body);
    try {
      const {user} = await Auth.getUserTokenAndData(req);
      if (user) {
        return res.status(401).send(Responses.response('You are already Logged In'));
      }
      return next();
    } catch (error) {
      res.status(401).send({error: 'Not authorized to access this resource'});
    }
  }
}

export default Auth;
