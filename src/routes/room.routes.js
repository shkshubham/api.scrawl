import Routes from './app';
import RoomController from '../controllers/room.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/create', Auth.UserAccess, RoomController.createRoom);
router.get('/join/:roomCode', Auth.UserAccess, RoomController.roomJoin);
router.get('/leave/:roomCode', Auth.UserAccess, RoomController.leaveRoom);
router.get('/search/:roomCode/', Auth.UserAccess, RoomController.roomDetail);
router.post('/kick/:roomCode/', Auth.UserAccess, RoomController.kickPlay);
router.post('/edit/:roomCode/', Auth.UserAccess, RoomController.editRoom);
router.get('/public', Auth.AllAccess, RoomController.listAllPublic);

export default router;

// TODO: To fix if the user leave the looby
