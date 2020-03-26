import Routes from './app';
import RoomController from '../controllers/room.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/create', Auth.UserAccess, RoomController.createRoom);
router.get('/join/:roomCode', Auth.UserAccess, RoomController.roomJoin);
router.get('/search/:roomCode/', Auth.UserAccess, RoomController.roomDetail);

export default router;
