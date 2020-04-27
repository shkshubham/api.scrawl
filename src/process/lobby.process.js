import Database from "../database";
import LobbyService from "../services/lobby.service";
import Logger from "../utils/logger";

class LobbyProcess {

    static async onPlayerDisconnectCheckAndDestroyLobby(userId) {
        try {
            const userFields = ['name', 'picture', 'email'];
            const categoryFields = ['name', 'language'];
            const lobbies = await Database.Lobby.findOne(
                {$or: [{
                  users: {
                    $elemMatch: {
                      user: userId,
                    },
                  },
                },
                {
                  'owner.user': userId,
                },
                ]}
            ).populate('owner.user', userFields).populate('users.user', userFields).populate('category', categoryFields).sort('-updatedAt');

            for(const lobby of lobbies) {
                Logger.normal("Lobby", lobby.lobbyCode, typeof userId)
                if(!lobby) {
                    Logger.normal("No Lobby")
                    return true;
                }
                const response = await LobbyService.leaveLobby(userId.toString(), lobby);
                Logger.normal(response, lobby.lobbyCode)
            }
            return true;
        } catch(err) {
            Logger.normal("Error occurred", err)
            return false;
        }
    }
}

export default LobbyProcess;