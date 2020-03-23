import Database from '../database';

class UserService {
    static auth = async (body) => {
      const {email, googleId} = body;
      body.password = googleId;
      try {
        let user = await Database.User.findByCredentials(email, body.password);
        if (!user) {
          const createdUser = await Database.User.create(body);
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
