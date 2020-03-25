import Responses from '../utils/responses';
import UserService from '../services/user.service';
import Utils from '../utils';

class UserController {
    static auth = async (req, res) => {
      try {
        const userDetail = Utils.decodeJWT(req.body.token);

        if (!userDetail) {
          return Responses.error(res, 'Please provide valid token');
        }
        const response = await UserService.auth(userDetail);
        if (response.error) {
          return Responses.error(res, response.error);
        }
        req.user = response.user;
        req.token = response.token;
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res);
      }
    }

    static profile = async (req, res) => {
      try {
        return Responses.normal(res, req.user);
      } catch (error) {
        return Responses.unknown(res);
      }
    }

    static logout = async (req, res) => {
      try {
        const response = await UserService.logout(req);
        return Responses.normal(res, response.message);
      } catch (err) {
        return Responses.unknown(res);
      }
    }
}


export default UserController;
