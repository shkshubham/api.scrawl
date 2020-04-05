import Database from '../database';
import Socket from './socket.service';

class UserService {
  static types = {
    LOOKING_PLAYERS_JOINED: 'LOOKING_PLAYERS_JOINED',
    LOOKING_PLAYERS_LEAVED: 'LOOKING_PLAYERS_LEAVED',
  }
  static auth = async (userData) => {
    try {
      const {email, sub} = userData;
      let user = await Database.User.findByCredentials(email, sub);
      if (!user) {
        const {name, picture} = userData;
        const createdUser = await Database.User.create({
          email,
          picture,
          name,
          googleId: sub,
          password: sub,
          country: '5e8a49508dd36b1eb4f2fe81',
        });
        user = createdUser;
      }
      const token = await user.generateAuthToken();
      const userDataDeepCopy = JSON.parse(JSON.stringify(user));
      delete userDataDeepCopy.password;
      delete userDataDeepCopy.tokens;
      delete userDataDeepCopy.__v;
      return {user: userDataDeepCopy, token};
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

  static async lookingForGame(req) {
    const user = await Database.User.findById({
      _id: req.user._id,
    }).select(['name', 'picture', 'looking']);
    if (user.looking && req.params.type === 'enable') {
      return {
        isValid: false,
        message: 'Your are already enabled',
      };
    } else if (!user.looking && req.params.type === 'disable') {
      return {
        isValid: false,
        message: 'Your are already disabled',
      };
    }
    switch (req.params.type) {
      case 'enable':
        Socket.emit(UserService.types.LOOKING_PLAYERS_JOINED, user);
        await user.update({
          looking: true,
        });
        return {
          isValid: true,
          message: 'Enabled',
        };
      case 'disable':
        Socket.emit(UserService.types.LOOKING_PLAYERS_LEAVED, user);
        await user.update({
          looking: false,
        });
        return {
          isValid: true,
          message: 'Disabled',
        };
      default:
        return {
          isValid: false,
          message: 'Please Provide Valid Type',
        };
    }
  }

  static async allLookingUsers() {
    return await Database.User.find({looking: true}).populate('country').select(['name', 'picture']).lean();
  }

  static async inviteUser(userId, room) {
    room.users = room.users.length;
    delete room.kickedUsers;
    Socket.emit(userId, room);
  }
}

export default UserService;
