import User from '../models/User';

class UserService {
    static createUser = async (body) => {
      const {email} = body;
      const user = await User.findOne({email});
      if (!user) {
        return await User.create(body);
      }
      return user;
    }
}

export default UserService;
