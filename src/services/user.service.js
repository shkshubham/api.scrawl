import Database from '../database';

class UserService {
    static auth = async (userData) => {
      const {email, sub} = userData;
      try {
        let user = await Database.User.findByCredentials(email, sub);
        if (!user) {
          console.log('=-------------', userData);
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

    static async logout(req) {
      const {user, token} = req;
      const userDetail = await this.getUserDetailById(user._id);
      const foundTokenIndex = userDetail.tokens.findIndex((data) => data.token === token);
      if (foundTokenIndex > -1) {
        userDetail.tokens.splice(foundTokenIndex, 1);
        await userDetail.save();
        return {
          message: 'Logged Out Successfully',
          logout: true,
        };
      } else {
        return {
          message: 'Invalid Token',
          logout: false,
        };
      }
    }
}

export default UserService;
