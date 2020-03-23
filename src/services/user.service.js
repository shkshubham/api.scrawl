import Database from '../database';

class UserService {
    static auth = async (userData) => {
      const {email, sub} = userData;
      try {
        let user = await Database.User.findByCredentials(email, sub);
        if (!user) {
          const {name, picture} = userData;
          const createdUser = await Database.User.create({
            email,
            picture,
            name,
            googleId: sub,
            password: sub,
          });
          user = createdUser;
        }
        const token = await user.generateAuthToken();
        const userData = JSON.parse(JSON.stringify(user));
        delete userData.password;
        delete userData.tokens;
        delete userData.__v;
        return {user: userData, token};
      } catch (error) {
        return {
          error: error.message,
        };
      }
    }

    static async getUserDetailById(_id) {
      return await Database.User.findById(_id);
    }
}

export default UserService;
