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
        const {
          _id,
          username,
          name,
          avatar,
          googleId,
        } = user;
        return {user: {
          _id,
          email,
          username,
          name,
          avatar,
          googleId,
        }, token};
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
