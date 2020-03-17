import Responses from '../utils/responses';
import UserService from '../services/user.service';

class UserController {
    static createUser = async (req, res) => {
      try {
        const response = await UserService.createUser(req.body);
        return Responses.normal(res, response);
      } catch (err) {
        return Responses.unknown(res);
      }
    }
}


export default UserController;
