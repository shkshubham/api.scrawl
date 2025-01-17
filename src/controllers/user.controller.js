import Responses from '../utils/responses';
import UserService from '../services/user.service';
import Utils from '../utils';
import LobbyService from '../services/lobby.service';
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
      return Responses.unknown(res, err);
    }
  }

  static profile = async (req, res) => {
    try {
      const response = await UserService.profile(req.user);
      return Responses.normal(res, response);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static logout = async (req, res) => {
    try {
      const response = await UserService.logout(req);
      if (response.logout) {
        return Responses.normal(res, null, response.message);
      }
      return Responses.error(res, response.message);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static lookingForGame = async (req, res) => {
    try {
      const {type} = req.params;
      if (!type) {
        return Responses.error(res, 'Please Provide Type');
      }
      const response = await UserService.lookingForGame(req);
      if (response.isValid) {
        return Responses.normal(res, null, response.message);
      }
      return Responses.error(res, response.message);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static allLookingUsers = async (_, res) => {
    try {
      const response = await UserService.allLookingUsers();
      if (response) {
        return Responses.normal(res, response);
      }
      return Responses.error(res, response.message);
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }

  static invite = async (req, res) => {
    try {
      const {userId, lobbyCode} = req.body;
      if (userId === req.user._id) {
        return Responses.error(res, 'You can not invite yourself');
      }
      const user = await UserService.getUserDetailById(userId);
      if (!user) {
        return Responses.error(res, 'Invalid user');
      }
      const lobby = await LobbyService.getLobbyWithOwnerDetail(lobbyCode);
      if (!lobby) {
        return Responses.error(res, 'Please provide valid lobby code');
      }
      await UserService.inviteUser(userId, lobby);
      return Responses.normal(res, 'Invitation Sent');
    } catch (err) {
      return Responses.unknown(res, err);
    }
  }
}

export default UserController;
