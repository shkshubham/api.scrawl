import Routes from './app';
import RoomController from '../controllers/room.controller';

const router = Routes.Router();

router.post('/create', RoomController.createRoom);

export default router;
