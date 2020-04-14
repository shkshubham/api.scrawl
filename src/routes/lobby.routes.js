import Routes from './app';
import LobbyController from '../controllers/lobby.controller';
import RoomController from '../controllers/room.controller';

const router = Routes.Router();
router.get('/create', Auth.UserAccess, RoomController.createRoom);
router.get('/join/:roomCode', Auth.UserAccess, RoomController.roomJoin);
router.get('/leave/:roomCode', Auth.UserAccess, RoomController.leaveRoom);
router.get('/search/:roomCode/', Auth.UserAccess, RoomController.roomDetail);
router.post('/kick/:roomCode/', Auth.UserAccess, RoomController.kickPlay);
router.post('/edit/:roomCode/', Auth.UserAccess, RoomController.editRoom);
router.get('/public', Auth.AllAccess, RoomController.listAllPublic);
router.get('/init', LobbyController.getLobbyDetails);

export default router;


// TODO: To fix if the user leave the looby
