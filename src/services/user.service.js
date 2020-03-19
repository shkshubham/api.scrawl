import User from '../models/User';
import Database from '../database';

class UserService {
    static createUser = async (body) => {
      const {email} = body;
      const user = await Database.User.findOne({email}).lean();
      if (!user) {
        return await User.create(body);
      }
      return user;
    }
}

export default UserService;
