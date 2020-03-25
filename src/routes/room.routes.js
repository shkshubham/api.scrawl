import Routes from './app';
import RoomController from '../controllers/room.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/create', Auth.UserAccess, RoomController.createRoom);

export default router;
