import Responses from '../utils/responses';
import UserService from '../services/user.service';

class UserController {
    static auth = async (req, res) => {
      try {
        const response = await UserService.auth(req.body);
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
}


export default UserController;
