import Routes from './app';
import LobbyController from '../controllers/lobby.controller';

const router = Routes.Router();

router.get('/init', LobbyController.getLobbyDetails);

export default router;
