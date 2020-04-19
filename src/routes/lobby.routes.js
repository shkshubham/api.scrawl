import Routes from './app';
import LobbyController from '../controllers/lobby.controller';
import Auth from '../middlewares/auth';

const router = Routes.Router();
router.get('/create', Auth.UserAccess, LobbyController.createLobby);
router.get('/join/:roomCode', Auth.UserAccess, LobbyController.lobbyJoin);
router.get('/leave/:roomCode', Auth.UserAccess, LobbyController.leaveLobby);
router.get('/search/:roomCode/', Auth.UserAccess, LobbyController.lobbyDetail);
router.post('/kick/:roomCode/', Auth.UserAccess, LobbyController.kickPlay);
router.post('/edit/:roomCode/', Auth.UserAccess, LobbyController.editLobby);
router.get('/public', Auth.AllAccess, LobbyController.listAllPublic);
router.get('/init', LobbyController.getLobbyDetails);

export default router;


// TODO: To fix if the user leave the looby
