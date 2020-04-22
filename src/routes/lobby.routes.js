import Routes from './app';
import LobbyController from '../controllers/lobby.controller';
import Auth from '../middlewares/auth';

const router = Routes.Router();
router.get('/create', Auth.UserAccess, LobbyController.createLobby);
router.get('/join/:lobbyCode', Auth.UserAccess, LobbyController.lobbyJoin);
router.get('/leave/:lobbyCode', Auth.UserAccess, LobbyController.leaveLobby);
router.get('/search/:lobbyCode/', Auth.UserAccess, LobbyController.lobbyDetail);
router.post('/kick/:lobbyCode/', Auth.UserAccess, LobbyController.kickPlayer);
router.post('/edit/:lobbyCode/', Auth.UserAccess, LobbyController.editLobby);
router.get('/public', Auth.AllAccess, LobbyController.listAllPublic);

export default router;


// TODO: To fix if the user leave the looby
